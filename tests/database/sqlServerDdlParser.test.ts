import { describe, expect, it } from "vitest";
import { parseSqlServerDdl } from "../../src/database/sqlServerDdlParser";

const DDL = `
-- esquema legacy
CREATE TABLE [dbo].[Customers] (
  [CustomerId] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  [Email]      NVARCHAR(180) NOT NULL UNIQUE,
  [Name]       VARCHAR(120) NULL,
  [Balance]    DECIMAL(12, 2) NULL DEFAULT (0)
);

CREATE TABLE dbo.Orders (
  OrderId    INT NOT NULL,
  CustomerId INT NOT NULL,
  Total      DECIMAL(12,2) NOT NULL,
  CONSTRAINT PK_Orders PRIMARY KEY (OrderId),
  CONSTRAINT FK_Orders_Customers FOREIGN KEY (CustomerId) REFERENCES dbo.Customers (CustomerId)
);

CREATE NONCLUSTERED INDEX IX_Orders_Customer ON dbo.Orders (CustomerId);
`;

describe("parseSqlServerDdl", () => {
  const schema = parseSqlServerDdl(DDL);

  it("extrae tablas con su esquema", () => {
    const names = schema.tables.map((t) => `${t.schemaName}.${t.tableName}`).sort();
    expect(names).toEqual(["dbo.Customers", "dbo.Orders"]);
  });

  it("extrae columnas con tipos, longitud y precisión", () => {
    const email = schema.columns.find((c) => c.tableName === "Customers" && c.columnName === "Email");
    expect(email?.dataType).toBe("nvarchar");
    expect(email?.maxLength).toBe(180);
    expect(email?.isNullable).toBe("NO");

    const balance = schema.columns.find((c) => c.tableName === "Customers" && c.columnName === "Balance");
    expect(balance?.dataType).toBe("decimal");
    expect(balance?.numericPrecision).toBe(12);
    expect(balance?.numericScale).toBe(2);
    expect(balance?.isNullable).toBe("YES");
  });

  it("detecta PK inline y PK a nivel de tabla", () => {
    const pks = schema.primaryKeys.map((p) => `${p.tableName}.${p.columnName}`).sort();
    expect(pks).toEqual(["Customers.CustomerId", "Orders.OrderId"]);
  });

  it("detecta FK a nivel de tabla resolviendo la referencia", () => {
    expect(schema.foreignKeys).toHaveLength(1);
    const fk = schema.foreignKeys[0];
    expect(fk.tableName).toBe("Orders");
    expect(fk.columnName).toBe("CustomerId");
    expect(fk.referencedTableName).toBe("Customers");
    expect(fk.referencedColumnName).toBe("CustomerId");
  });

  it("detecta UNIQUE inline y CREATE INDEX", () => {
    const unique = schema.indexes.find((i) => i.isUnique);
    expect(unique?.tableName).toBe("Customers");
    expect(unique?.columnName).toBe("Email");

    const idx = schema.indexes.find((i) => i.indexName === "IX_Orders_Customer");
    expect(idx?.tableName).toBe("Orders");
    expect(idx?.columnName).toBe("CustomerId");
    expect(idx?.isUnique).toBe(false);
  });
});
