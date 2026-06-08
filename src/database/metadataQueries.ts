import type { DatabaseEngine } from '../types/database.types';

export const metadataQueries = {
  tables(engine: DatabaseEngine) {
    if (engine === 'sqlserver') {
      return `
        SELECT
          TABLE_SCHEMA AS schema_name,
          TABLE_NAME AS table_name,
          TABLE_TYPE AS table_type
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = @schema
        ORDER BY TABLE_SCHEMA, TABLE_NAME
      `;
    }

    return `
      SELECT
        table_schema AS schema_name,
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = @schema
      ORDER BY table_schema, table_name
    `;
  },

  columns(engine: DatabaseEngine) {
    if (engine === 'sqlserver') {
      return `
        SELECT
          TABLE_SCHEMA AS schema_name,
          TABLE_NAME AS table_name,
          COLUMN_NAME AS column_name,
          DATA_TYPE AS data_type,
          IS_NULLABLE AS is_nullable,
          COLUMN_DEFAULT AS column_default,
          ORDINAL_POSITION AS ordinal_position
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = @schema
          AND (@tableName IS NULL OR TABLE_NAME = @tableName)
        ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION
      `;
    }

    return `
      SELECT
        table_schema AS schema_name,
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default,
        ordinal_position
      FROM information_schema.columns
      WHERE table_schema = @schema
        AND (@tableName IS NULL OR table_name = @tableName)
      ORDER BY table_schema, table_name, ordinal_position
    `;
  },

  relationships(engine: DatabaseEngine) {
    if (engine === 'sqlserver') {
      return `
        SELECT
          fk.name AS constraint_name,
          SCHEMA_NAME(tp.schema_id) AS schema_name,
          tp.name AS table_name,
          cp.name AS column_name,
          tr.name AS referenced_table_name,
          cr.name AS referenced_column_name
        FROM sys.foreign_keys fk
        INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
        INNER JOIN sys.tables tp ON fkc.parent_object_id = tp.object_id
        INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
        INNER JOIN sys.tables tr ON fkc.referenced_object_id = tr.object_id
        INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
        WHERE SCHEMA_NAME(tp.schema_id) = @schema
        ORDER BY tp.name, fk.name
      `;
    }

    return `
      SELECT
        tc.constraint_name,
        tc.table_schema AS schema_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS referenced_table_name,
        ccu.column_name AS referenced_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
       AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = @schema
      ORDER BY tc.table_name, tc.constraint_name
    `;
  },

  indexes(engine: DatabaseEngine) {
    if (engine === 'sqlserver') {
      return `
        SELECT
          SCHEMA_NAME(t.schema_id) AS schema_name,
          t.name AS table_name,
          i.name AS index_name,
          i.is_unique,
          i.type_desc AS index_type,
          STRING_AGG(c.name, ',') WITHIN GROUP (ORDER BY ic.key_ordinal) AS columns
        FROM sys.indexes i
        INNER JOIN sys.tables t ON i.object_id = t.object_id
        INNER JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE SCHEMA_NAME(t.schema_id) = @schema
          AND i.name IS NOT NULL
        GROUP BY t.schema_id, t.name, i.name, i.is_unique, i.type_desc
        ORDER BY t.name, i.name
      `;
    }

    return `
      SELECT
        schemaname AS schema_name,
        tablename AS table_name,
        indexname AS index_name,
        indexdef AS definition,
        false AS is_unique,
        'btree' AS index_type,
        NULL AS columns
      FROM pg_indexes
      WHERE schemaname = @schema
      ORDER BY tablename, indexname
    `;
  },

  explain(engine: DatabaseEngine, sqlText: string) {
    if (engine === 'sqlserver') {
      return `SET SHOWPLAN_TEXT ON; ${sqlText}; SET SHOWPLAN_TEXT OFF;`;
    }

    return `EXPLAIN (FORMAT JSON) ${sqlText}`;
  },
};

