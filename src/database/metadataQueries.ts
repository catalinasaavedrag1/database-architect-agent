export const metadataQueries = {
  getTables: `
    SELECT 
      TABLE_SCHEMA AS schemaName,
      TABLE_NAME AS tableName,
      TABLE_TYPE AS tableType
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_SCHEMA, TABLE_NAME;
  `,
  getColumns: `
    SELECT 
      c.TABLE_SCHEMA AS schemaName,
      c.TABLE_NAME AS tableName,
      c.COLUMN_NAME AS columnName,
      c.DATA_TYPE AS dataType,
      c.CHARACTER_MAXIMUM_LENGTH AS maxLength,
      c.NUMERIC_PRECISION AS numericPrecision,
      c.NUMERIC_SCALE AS numericScale,
      c.IS_NULLABLE AS isNullable,
      c.COLUMN_DEFAULT AS defaultValue,
      c.ORDINAL_POSITION AS ordinalPosition
    FROM INFORMATION_SCHEMA.COLUMNS c
    ORDER BY c.TABLE_SCHEMA, c.TABLE_NAME, c.ORDINAL_POSITION;
  `,
  getPrimaryKeys: `
    SELECT 
      KU.TABLE_SCHEMA AS schemaName,
      KU.TABLE_NAME AS tableName,
      KU.COLUMN_NAME AS columnName,
      TC.CONSTRAINT_NAME AS constraintName
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS TC
    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE KU
      ON TC.CONSTRAINT_NAME = KU.CONSTRAINT_NAME
      AND TC.TABLE_SCHEMA = KU.TABLE_SCHEMA
      AND TC.TABLE_NAME = KU.TABLE_NAME
    WHERE TC.CONSTRAINT_TYPE = 'PRIMARY KEY'
    ORDER BY KU.TABLE_SCHEMA, KU.TABLE_NAME, KU.ORDINAL_POSITION;
  `,
  getForeignKeys: `
    SELECT
      fk.name AS foreignKeyName,
      sch1.name AS schemaName,
      tab1.name AS tableName,
      col1.name AS columnName,
      sch2.name AS referencedSchemaName,
      tab2.name AS referencedTableName,
      col2.name AS referencedColumnName
    FROM sys.foreign_key_columns fkc
    INNER JOIN sys.foreign_keys fk 
      ON fkc.constraint_object_id = fk.object_id
    INNER JOIN sys.tables tab1 
      ON fkc.parent_object_id = tab1.object_id
    INNER JOIN sys.schemas sch1 
      ON tab1.schema_id = sch1.schema_id
    INNER JOIN sys.columns col1 
      ON fkc.parent_object_id = col1.object_id 
      AND fkc.parent_column_id = col1.column_id
    INNER JOIN sys.tables tab2 
      ON fkc.referenced_object_id = tab2.object_id
    INNER JOIN sys.schemas sch2 
      ON tab2.schema_id = sch2.schema_id
    INNER JOIN sys.columns col2 
      ON fkc.referenced_object_id = col2.object_id 
      AND fkc.referenced_column_id = col2.column_id
    ORDER BY sch1.name, tab1.name, fk.name;
  `,
  getIndexes: `
    SELECT
      s.name AS schemaName,
      t.name AS tableName,
      i.name AS indexName,
      i.type_desc AS indexType,
      i.is_unique AS isUnique,
      i.is_primary_key AS isPrimaryKey,
      c.name AS columnName,
      ic.key_ordinal AS keyOrdinal,
      ic.is_included_column AS isIncludedColumn
    FROM sys.indexes i
    INNER JOIN sys.tables t 
      ON i.object_id = t.object_id
    INNER JOIN sys.schemas s 
      ON t.schema_id = s.schema_id
    INNER JOIN sys.index_columns ic 
      ON i.object_id = ic.object_id 
      AND i.index_id = ic.index_id
    INNER JOIN sys.columns c 
      ON ic.object_id = c.object_id 
      AND ic.column_id = c.column_id
    WHERE i.name IS NOT NULL
    ORDER BY s.name, t.name, i.name, ic.key_ordinal;
  `,
};
