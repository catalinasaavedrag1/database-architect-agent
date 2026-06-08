import type {
  DatabaseColumn,
  DatabaseForeignKey,
  DatabaseIndex,
  DatabasePrimaryKey,
  DatabaseTable,
  FullDatabaseSchema,
} from "../tools/readSchema.tool";

/**
 * Parser pragmático de `schema.prisma` -> `FullDatabaseSchema`.
 *
 * Permite que el agente revise CUALQUIER microservicio enviando su archivo
 * `schema.prisma` en la petición, sin conectarse a ninguna base de datos.
 *
 * No implementa toda la gramática de Prisma: extrae lo que el arquitecto
 * necesita para razonar (tablas, columnas, tipos, nulabilidad, claves
 * primarias, claves foráneas, índices y unicidad).
 */

const SCALAR_TYPES = new Set([
  "String",
  "Boolean",
  "Int",
  "BigInt",
  "Float",
  "Decimal",
  "DateTime",
  "Json",
  "Bytes",
]);

const TYPE_MAP: Record<string, string> = {
  String: "varchar",
  Boolean: "boolean",
  Int: "int",
  BigInt: "bigint",
  Float: "double precision",
  Decimal: "decimal",
  DateTime: "timestamp",
  Json: "jsonb",
  Bytes: "bytea",
};

interface ParsedField {
  name: string;
  type: string;
  isList: boolean;
  isOptional: boolean;
  attrs: string;
}

interface ParsedModel {
  name: string;
  tableName: string;
  fields: ParsedField[];
  blockAttrs: string[];
}

/** Quita comentarios (`//`, `///`) conservando el contenido de cada línea. */
function stripComments(source: string): string {
  return source
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("//");
      return idx >= 0 ? line.slice(0, idx) : line;
    })
    .join("\n");
}

function extractBlocks(source: string, keyword: string): Array<{ name: string; body: string }> {
  const blocks: Array<{ name: string; body: string }> = [];
  const regex = new RegExp(`${keyword}\\s+(\\w+)\\s*\\{([\\s\\S]*?)\\}`, "g");
  let match: RegExpExecArray | null;
  while ((match = regex.exec(source)) !== null) {
    blocks.push({ name: match[1], body: match[2] });
  }
  return blocks;
}

function unquote(value: string): string {
  return value.replace(/^["']|["']$/g, "");
}

function attrValue(attrs: string, name: string): string | undefined {
  // Captura el primer argumento posicional o el contenido de @name(...)
  const regex = new RegExp(`@${name}\\(([^)]*)\\)`);
  const match = attrs.match(regex);
  return match ? match[1].trim() : undefined;
}

function parseModelBody(name: string, body: string): ParsedModel {
  const fields: ParsedField[] = [];
  const blockAttrs: string[] = [];
  let tableName = name;

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("@@")) {
      blockAttrs.push(line);
      const mapValue = line.match(/^@@map\(\s*["']([^"']+)["']\s*\)/);
      if (mapValue) tableName = mapValue[1];
      continue;
    }

    const tokens = line.split(/\s+/);
    if (tokens.length < 2) continue;

    const fieldName = tokens[0];
    let typeToken = tokens[1];
    const attrs = line.slice(line.indexOf(typeToken) + typeToken.length).trim();

    const isList = typeToken.endsWith("[]");
    if (isList) typeToken = typeToken.slice(0, -2);
    const isOptional = typeToken.endsWith("?");
    if (isOptional) typeToken = typeToken.replace(/\?$/, "");

    fields.push({ name: fieldName, type: typeToken, isList, isOptional, attrs });
  }

  return { name, tableName, fields, blockAttrs };
}

function columnDataType(field: ParsedField, enumNames: Set<string>): string {
  if (enumNames.has(field.type)) return `enum(${field.type})`;
  return TYPE_MAP[field.type] ?? field.type.toLowerCase();
}

function maxLengthOf(attrs: string): number | null {
  const m = attrs.match(/@db\.(?:VarChar|Char|NVarChar|NChar)\((\d+)\)/);
  return m ? Number(m[1]) : null;
}

function precisionScaleOf(attrs: string): { precision: number | null; scale: number | null } {
  const m = attrs.match(/@db\.Decimal\((\d+)\s*,\s*(\d+)\)/);
  if (!m) return { precision: null, scale: null };
  return { precision: Number(m[1]), scale: Number(m[2]) };
}

function defaultOf(attrs: string): string | null {
  const v = attrValue(attrs, "default");
  return v === undefined ? null : v;
}

/** Lista de columnas dentro de `[a, b]` -> ["a", "b"]. */
function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  const m = raw.match(/\[([^\]]*)\]/);
  const inner = m ? m[1] : raw;
  return inner
    .split(",")
    .map((s) => unquote(s.trim()))
    .filter(Boolean);
}

export function parsePrismaSchema(
  source: string,
  schemaName = "public"
): FullDatabaseSchema {
  const clean = stripComments(source);

  const enumNames = new Set(extractBlocks(clean, "enum").map((b) => b.name));
  const models = extractBlocks(clean, "model").map((b) => parseModelBody(b.name, b.body));

  // model name -> table name, y model name -> (field name -> column name)
  const modelToTable = new Map<string, string>();
  const fieldColumnName = new Map<string, Map<string, string>>();
  for (const model of models) {
    modelToTable.set(model.name, model.tableName);
    const cols = new Map<string, string>();
    for (const f of model.fields) {
      const mapped = f.attrs.match(/@map\(\s*["']([^"']+)["']\s*\)/);
      cols.set(f.name, mapped ? mapped[1] : f.name);
    }
    fieldColumnName.set(model.name, cols);
  }

  const tables: DatabaseTable[] = [];
  const columns: DatabaseColumn[] = [];
  const primaryKeys: DatabasePrimaryKey[] = [];
  const foreignKeys: DatabaseForeignKey[] = [];
  const indexes: DatabaseIndex[] = [];

  for (const model of models) {
    const tableName = model.tableName;
    tables.push({ schemaName, tableName, tableType: "BASE TABLE" });

    const isScalar = (type: string) => SCALAR_TYPES.has(type) || enumNames.has(type);
    const colName = (fieldName: string) => fieldColumnName.get(model.name)?.get(fieldName) ?? fieldName;

    let ordinal = 0;

    for (const field of model.fields) {
      const isRelation = !isScalar(field.type);

      // Columnas escalares (incluye campos FK escalares como `authorId`)
      if (!isRelation && !field.isList) {
        ordinal += 1;
        const { precision, scale } = precisionScaleOf(field.attrs);
        columns.push({
          schemaName,
          tableName,
          columnName: colName(field.name),
          dataType: columnDataType(field, enumNames),
          maxLength: maxLengthOf(field.attrs),
          numericPrecision: precision,
          numericScale: scale,
          isNullable: field.isOptional ? "YES" : "NO",
          defaultValue: defaultOf(field.attrs),
          ordinalPosition: ordinal,
        });

        // PK por campo: @id
        if (/@id\b/.test(field.attrs)) {
          primaryKeys.push({
            schemaName,
            tableName,
            columnName: colName(field.name),
            constraintName: `${tableName}_pkey`,
          });
        }

        // Unique por campo: @unique
        if (/@unique\b/.test(field.attrs)) {
          indexes.push({
            schemaName,
            tableName,
            indexName: `${tableName}_${colName(field.name)}_key`,
            indexType: "btree",
            isUnique: true,
            isPrimaryKey: false,
            columnName: colName(field.name),
            keyOrdinal: 1,
            isIncludedColumn: false,
          });
        }
      }

      // FK por relación con @relation(fields: [...], references: [...])
      if (isRelation && /@relation\s*\(/.test(field.attrs)) {
        const fieldsRaw = field.attrs.match(/fields\s*:\s*(\[[^\]]*\])/);
        const referencesRaw = field.attrs.match(/references\s*:\s*(\[[^\]]*\])/);
        const fkCols = parseList(fieldsRaw?.[1]);
        const refCols = parseList(referencesRaw?.[1]);
        const referencedTable = modelToTable.get(field.type) ?? field.type;

        fkCols.forEach((fkCol, i) => {
          foreignKeys.push({
            foreignKeyName: `${tableName}_${fkCol}_fkey`,
            schemaName,
            tableName,
            columnName: colName(fkCol),
            referencedSchemaName: schemaName,
            referencedTableName: referencedTable,
            referencedColumnName: refCols[i] ?? refCols[0] ?? "id",
          });
        });
      }
    }

    // Atributos de bloque: @@id, @@unique, @@index
    for (const attr of model.blockAttrs) {
      const idCols = attr.startsWith("@@id") ? parseList(attrValue(attr, "id") ?? attr) : [];
      idCols.forEach((c) =>
        primaryKeys.push({
          schemaName,
          tableName,
          columnName: colName(c),
          constraintName: `${tableName}_pkey`,
        })
      );

      const uniqueCols = attr.startsWith("@@unique") ? parseList(attrValue(attr, "unique") ?? attr) : [];
      if (uniqueCols.length > 0) {
        const indexName = `${tableName}_${uniqueCols.join("_")}_key`;
        uniqueCols.forEach((c, i) =>
          indexes.push({
            schemaName,
            tableName,
            indexName,
            indexType: "btree",
            isUnique: true,
            isPrimaryKey: false,
            columnName: colName(c),
            keyOrdinal: i + 1,
            isIncludedColumn: false,
          })
        );
      }

      const indexCols = attr.startsWith("@@index") ? parseList(attrValue(attr, "index") ?? attr) : [];
      if (indexCols.length > 0) {
        const indexName = `${tableName}_${indexCols.join("_")}_idx`;
        indexCols.forEach((c, i) =>
          indexes.push({
            schemaName,
            tableName,
            indexName,
            indexType: "btree",
            isUnique: false,
            isPrimaryKey: false,
            columnName: colName(c),
            keyOrdinal: i + 1,
            isIncludedColumn: false,
          })
        );
      }
    }
  }

  return { tables, columns, primaryKeys, foreignKeys, indexes };
}
