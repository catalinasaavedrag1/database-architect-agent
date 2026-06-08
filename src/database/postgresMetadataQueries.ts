/**
 * PostgreSQL metadata queries. Column aliases are double-quoted so Postgres
 * preserves their camelCase, making each row match the same shapes returned by
 * the SQL Server queries (DatabaseTable, DatabaseColumn, ...). System schemas
 * (pg_catalog, information_schema) are excluded.
 */
export const postgresMetadataQueries = {
  getTables: `
    SELECT
      table_schema AS "schemaName",
      table_name   AS "tableName",
      table_type   AS "tableType"
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name;
  `,
  getColumns: `
    SELECT
      table_schema             AS "schemaName",
      table_name               AS "tableName",
      column_name              AS "columnName",
      data_type                AS "dataType",
      character_maximum_length AS "maxLength",
      numeric_precision        AS "numericPrecision",
      numeric_scale            AS "numericScale",
      is_nullable              AS "isNullable",
      column_default           AS "defaultValue",
      ordinal_position         AS "ordinalPosition"
    FROM information_schema.columns
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name, ordinal_position;
  `,
  getPrimaryKeys: `
    SELECT
      tc.table_schema   AS "schemaName",
      tc.table_name     AS "tableName",
      kcu.column_name   AS "columnName",
      tc.constraint_name AS "constraintName"
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY tc.table_schema, tc.table_name, kcu.ordinal_position;
  `,
  getForeignKeys: `
    SELECT
      tc.constraint_name AS "foreignKeyName",
      tc.table_schema    AS "schemaName",
      tc.table_name      AS "tableName",
      kcu.column_name    AS "columnName",
      ccu.table_schema   AS "referencedSchemaName",
      ccu.table_name     AS "referencedTableName",
      ccu.column_name    AS "referencedColumnName"
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON tc.constraint_name = ccu.constraint_name
      AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY tc.table_schema, tc.table_name, tc.constraint_name;
  `,
  getIndexes: `
    SELECT
      n.nspname        AS "schemaName",
      t.relname        AS "tableName",
      i.relname        AS "indexName",
      am.amname        AS "indexType",
      ix.indisunique   AS "isUnique",
      ix.indisprimary  AS "isPrimaryKey",
      a.attname        AS "columnName",
      k.ordinality::int AS "keyOrdinal",
      false            AS "isIncludedColumn"
    FROM pg_index ix
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_class t ON t.oid = ix.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_am am ON am.oid = i.relam
    JOIN LATERAL unnest(ix.indkey) WITH ORDINALITY AS k(attnum, ordinality) ON true
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = k.attnum
    WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND t.relkind IN ('r', 'p')
      AND k.attnum <> 0
    ORDER BY n.nspname, t.relname, i.relname, k.ordinality;
  `,
};
