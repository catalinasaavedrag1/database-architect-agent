import type {
  DatabaseColumn,
  DatabaseForeignKey,
  DatabaseIndex,
  DatabasePrimaryKey,
  DatabaseTable,
  FullDatabaseSchema,
} from "../tools/readSchema.tool";

/**
 * Parser pragmático de DDL de SQL Server (`CREATE TABLE` / `ALTER TABLE ... ADD
 * FOREIGN KEY` / `CREATE INDEX`) -> `FullDatabaseSchema`.
 *
 * Pensado para revisar/migrar microservicios legacy de los que solo se tiene el
 * script `.sql` (sin acceso a la BD). No cubre toda la gramática T-SQL: extrae
 * lo que el arquitecto necesita (tablas, columnas, tipos, nulabilidad, PKs, FKs
 * e índices/unicidad).
 */

const CHAR_TYPES = new Set(["varchar", "nvarchar", "char", "nchar", "binary", "varbinary"]);
const DECIMAL_TYPES = new Set(["decimal", "numeric"]);

const CONSTRAINT_STARTERS = /^(CONSTRAINT|PRIMARY|FOREIGN|UNIQUE|CHECK|KEY|INDEX)\b/i;

function stripSqlComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, " ") // bloque /* */
    .split("\n")
    .map((line) => {
      const idx = line.indexOf("--");
      return idx >= 0 ? line.slice(0, idx) : line;
    })
    .join("\n");
}

/** Quita corchetes/comillas de un identificador: `[dbo].[Orders]` -> `dbo.Orders`. */
function ident(raw: string): string {
  return raw.replace(/[[\]"`]/g, "").trim();
}

function splitName(raw: string, defaultSchema: string): { schemaName: string; tableName: string } {
  const parts = ident(raw)
    .split(".")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) return { schemaName: parts[0], tableName: parts[parts.length - 1] };
  return { schemaName: defaultSchema, tableName: parts[0] ?? raw };
}

/** Extrae el contenido entre paréntesis balanceados a partir del `(` en `open`. */
function balanced(text: string, open: number): { body: string; end: number } | null {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++;
    else if (text[i] === ")") {
      depth--;
      if (depth === 0) return { body: text.slice(open + 1, i), end: i };
    }
  }
  return null;
}

/** Separa por comas de nivel superior (respeta paréntesis anidados). */
function splitTopLevel(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of body) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function cols(list: string): string[] {
  return list
    .split(",")
    .map((c) => ident(c).replace(/\s+(asc|desc)$/i, "").trim())
    .filter(Boolean);
}

export function parseSqlServerDdl(
  source: string,
  defaultSchema = "dbo"
): FullDatabaseSchema {
  const clean = stripSqlComments(source);

  const tables: DatabaseTable[] = [];
  const columns: DatabaseColumn[] = [];
  const primaryKeys: DatabasePrimaryKey[] = [];
  const foreignKeys: DatabaseForeignKey[] = [];
  const indexes: DatabaseIndex[] = [];

  // ---- CREATE TABLE ----
  const createRegex = /create\s+table\s+([[\]"`\w.]+)\s*\(/gi;
  let match: RegExpExecArray | null;
  while ((match = createRegex.exec(clean)) !== null) {
    const { schemaName, tableName } = splitName(match[1], defaultSchema);
    const openParen = match.index + match[0].length - 1;
    const extracted = balanced(clean, openParen);
    if (!extracted) continue;

    tables.push({ schemaName, tableName, tableType: "BASE TABLE" });

    let ordinal = 0;
    for (const part of splitTopLevel(extracted.body)) {
      if (CONSTRAINT_STARTERS.test(part)) {
        parseTableConstraint(part, schemaName, tableName, defaultSchema, {
          primaryKeys,
          foreignKeys,
          indexes,
        });
        continue;
      }

      // Definición de columna
      const colMatch = part.match(
        /^\s*([[\]"`\w]+)\s+([A-Za-z0-9_]+)\s*(\([^)]*\))?([\s\S]*)$/
      );
      if (!colMatch) continue;

      const columnName = ident(colMatch[1]);
      const baseType = colMatch[2].toLowerCase();
      const lenSpec = colMatch[3] ?? "";
      const flags = colMatch[4] ?? "";
      const upperFlags = flags.toUpperCase();

      let maxLength: number | null = null;
      let numericPrecision: number | null = null;
      let numericScale: number | null = null;
      const lenInner = lenSpec.replace(/[()]/g, "").trim();
      if (DECIMAL_TYPES.has(baseType) && lenInner.includes(",")) {
        const [p, s] = lenInner.split(",").map((n) => Number(n.trim()));
        numericPrecision = Number.isFinite(p) ? p : null;
        numericScale = Number.isFinite(s) ? s : null;
      } else if (CHAR_TYPES.has(baseType) && /^\d+$/.test(lenInner)) {
        maxLength = Number(lenInner);
      }

      const isPk = /\bPRIMARY\s+KEY\b/.test(upperFlags);
      const notNull = /\bNOT\s+NULL\b/.test(upperFlags);
      const defaultMatch = flags.match(/\bDEFAULT\s+(\(?[^,]*?\)?)(?:\s|$)/i);

      ordinal += 1;
      columns.push({
        schemaName,
        tableName,
        columnName,
        dataType: baseType,
        maxLength,
        numericPrecision,
        numericScale,
        isNullable: notNull || isPk ? "NO" : "YES",
        defaultValue: defaultMatch ? defaultMatch[1].trim() : null,
        ordinalPosition: ordinal,
      });

      if (isPk) {
        primaryKeys.push({
          schemaName,
          tableName,
          columnName,
          constraintName: `PK_${tableName}`,
        });
      }

      if (/\bUNIQUE\b/.test(upperFlags)) {
        indexes.push(uniqueIndex(schemaName, tableName, [columnName]));
      }

      const refMatch = flags.match(
        /\bREFERENCES\s+([[\]"`\w.]+)\s*\(\s*([[\]"`\w]+)\s*\)/i
      );
      if (refMatch) {
        const ref = splitName(refMatch[1], defaultSchema);
        foreignKeys.push({
          foreignKeyName: `FK_${tableName}_${columnName}`,
          schemaName,
          tableName,
          columnName,
          referencedSchemaName: ref.schemaName,
          referencedTableName: ref.tableName,
          referencedColumnName: ident(refMatch[2]),
        });
      }
    }
  }

  // ---- ALTER TABLE ... ADD [CONSTRAINT] FOREIGN KEY ... REFERENCES ... ----
  const alterFk =
    /alter\s+table\s+([[\]"`\w.]+)\s+(?:with\s+(?:no)?check\s+)?add\s+(?:constraint\s+[[\]"`\w]+\s+)?foreign\s+key\s*\(([^)]*)\)\s*references\s+([[\]"`\w.]+)\s*\(([^)]*)\)/gi;
  while ((match = alterFk.exec(clean)) !== null) {
    const src = splitName(match[1], defaultSchema);
    const ref = splitName(match[3], defaultSchema);
    const fkCols = cols(match[2]);
    const refCols = cols(match[4]);
    fkCols.forEach((c, i) =>
      foreignKeys.push({
        foreignKeyName: `FK_${src.tableName}_${c}`,
        schemaName: src.schemaName,
        tableName: src.tableName,
        columnName: c,
        referencedSchemaName: ref.schemaName,
        referencedTableName: ref.tableName,
        referencedColumnName: refCols[i] ?? refCols[0] ?? "id",
      })
    );
  }

  // ---- CREATE [UNIQUE] [CLUSTERED|NONCLUSTERED] INDEX name ON table (cols) ----
  const createIndex =
    /create\s+(unique\s+)?(?:clustered\s+|nonclustered\s+)?index\s+([[\]"`\w]+)\s+on\s+([[\]"`\w.]+)\s*\(([^)]*)\)/gi;
  while ((match = createIndex.exec(clean)) !== null) {
    const isUnique = Boolean(match[1]);
    const indexName = ident(match[2]);
    const { schemaName, tableName } = splitName(match[3], defaultSchema);
    cols(match[4]).forEach((c, i) =>
      indexes.push({
        schemaName,
        tableName,
        indexName,
        indexType: "NONCLUSTERED",
        isUnique,
        isPrimaryKey: false,
        columnName: c,
        keyOrdinal: i + 1,
        isIncludedColumn: false,
      })
    );
  }

  return { tables, columns, primaryKeys, foreignKeys, indexes };
}

function uniqueIndex(schemaName: string, tableName: string, columnNames: string[]): DatabaseIndex {
  return {
    schemaName,
    tableName,
    indexName: `UQ_${tableName}_${columnNames.join("_")}`,
    indexType: "NONCLUSTERED",
    isUnique: true,
    isPrimaryKey: false,
    columnName: columnNames[0],
    keyOrdinal: 1,
    isIncludedColumn: false,
  };
}

function parseTableConstraint(
  part: string,
  schemaName: string,
  tableName: string,
  defaultSchema: string,
  out: {
    primaryKeys: DatabasePrimaryKey[];
    foreignKeys: DatabaseForeignKey[];
    indexes: DatabaseIndex[];
  }
): void {
  const fk = part.match(
    /foreign\s+key\s*\(([^)]*)\)\s*references\s+([[\]"`\w.]+)\s*\(([^)]*)\)/i
  );
  if (fk) {
    const ref = splitName(fk[2], defaultSchema);
    const fkCols = cols(fk[1]);
    const refCols = cols(fk[3]);
    fkCols.forEach((c, i) =>
      out.foreignKeys.push({
        foreignKeyName: `FK_${tableName}_${c}`,
        schemaName,
        tableName,
        columnName: c,
        referencedSchemaName: ref.schemaName,
        referencedTableName: ref.tableName,
        referencedColumnName: refCols[i] ?? refCols[0] ?? "id",
      })
    );
    return;
  }

  const pk = part.match(/primary\s+key\b[^(]*\(([^)]*)\)/i);
  if (pk) {
    cols(pk[1]).forEach((c) =>
      out.primaryKeys.push({
        schemaName,
        tableName,
        columnName: c,
        constraintName: `PK_${tableName}`,
      })
    );
    return;
  }

  const uq = part.match(/unique\b[^(]*\(([^)]*)\)/i);
  if (uq) {
    const uqCols = cols(uq[1]);
    uqCols.forEach((c, i) =>
      out.indexes.push({
        schemaName,
        tableName,
        indexName: `UQ_${tableName}_${uqCols.join("_")}`,
        indexType: "NONCLUSTERED",
        isUnique: true,
        isPrimaryKey: false,
        columnName: c,
        keyOrdinal: i + 1,
        isIncludedColumn: false,
      })
    );
  }
}
