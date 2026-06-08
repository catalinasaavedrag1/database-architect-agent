import type { FullDatabaseSchema } from "../../src/tools/readSchema.tool";

/**
 * Deterministic in-memory schema used by the analyzer/documentation tests.
 *
 * Shape of the modelled database:
 * - dbo.Customers : has PK, no FK, one index, one nullable column.
 * - dbo.Orders    : has PK, one FK -> Customers, one index.
 * - dbo.OrphanTable: no PK, no FK, no index, one nullable column.
 */
export const sampleSchema: FullDatabaseSchema = {
  tables: [
    { schemaName: "dbo", tableName: "Customers", tableType: "BASE TABLE" },
    { schemaName: "dbo", tableName: "Orders", tableType: "BASE TABLE" },
    { schemaName: "dbo", tableName: "OrphanTable", tableType: "BASE TABLE" },
  ],
  columns: [
    {
      schemaName: "dbo",
      tableName: "Customers",
      columnName: "CustomerId",
      dataType: "int",
      maxLength: null,
      numericPrecision: 10,
      numericScale: 0,
      isNullable: "NO",
      defaultValue: null,
      ordinalPosition: 1,
    },
    {
      schemaName: "dbo",
      tableName: "Customers",
      columnName: "Name",
      dataType: "nvarchar",
      maxLength: 200,
      numericPrecision: null,
      numericScale: null,
      isNullable: "YES",
      defaultValue: null,
      ordinalPosition: 2,
    },
    {
      schemaName: "dbo",
      tableName: "Orders",
      columnName: "OrderId",
      dataType: "int",
      maxLength: null,
      numericPrecision: 10,
      numericScale: 0,
      isNullable: "NO",
      defaultValue: null,
      ordinalPosition: 1,
    },
    {
      schemaName: "dbo",
      tableName: "Orders",
      columnName: "CustomerId",
      dataType: "int",
      maxLength: null,
      numericPrecision: 10,
      numericScale: 0,
      isNullable: "NO",
      defaultValue: null,
      ordinalPosition: 2,
    },
    {
      schemaName: "dbo",
      tableName: "OrphanTable",
      columnName: "Note",
      dataType: "nvarchar",
      maxLength: 4000,
      numericPrecision: null,
      numericScale: null,
      isNullable: "YES",
      defaultValue: null,
      ordinalPosition: 1,
    },
  ],
  primaryKeys: [
    {
      schemaName: "dbo",
      tableName: "Customers",
      columnName: "CustomerId",
      constraintName: "PK_Customers",
    },
    {
      schemaName: "dbo",
      tableName: "Orders",
      columnName: "OrderId",
      constraintName: "PK_Orders",
    },
  ],
  foreignKeys: [
    {
      foreignKeyName: "FK_Orders_Customers",
      schemaName: "dbo",
      tableName: "Orders",
      columnName: "CustomerId",
      referencedSchemaName: "dbo",
      referencedTableName: "Customers",
      referencedColumnName: "CustomerId",
    },
  ],
  indexes: [
    {
      schemaName: "dbo",
      tableName: "Customers",
      indexName: "IX_Customers_Name",
      indexType: "NONCLUSTERED",
      isUnique: false,
      isPrimaryKey: false,
      columnName: "Name",
      keyOrdinal: 1,
      isIncludedColumn: false,
    },
    {
      schemaName: "dbo",
      tableName: "Orders",
      indexName: "IX_Orders_CustomerId",
      indexType: "NONCLUSTERED",
      isUnique: false,
      isPrimaryKey: false,
      columnName: "CustomerId",
      keyOrdinal: 1,
      isIncludedColumn: false,
    },
  ],
};
