import { describe, expect, it } from "vitest";
import { parsePrismaSchema } from "../../src/database/prismaSchemaParser";

const SAMPLE = `
// un comentario
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique @db.VarChar(180)
  name  String?
  posts Post[]
  @@map("users")
}

model Post {
  id       Int    @id
  title    String
  authorId Int
  author   User   @relation(fields: [authorId], references: [id])
  @@index([authorId])
}
`;

describe("parsePrismaSchema", () => {
  const schema = parsePrismaSchema(SAMPLE);

  it("mapea modelos a tablas (respeta @@map)", () => {
    const names = schema.tables.map((t) => t.tableName).sort();
    expect(names).toEqual(["Post", "users"]);
  });

  it("extrae columnas escalares e ignora relaciones y listas", () => {
    const userCols = schema.columns
      .filter((c) => c.tableName === "users")
      .map((c) => c.columnName)
      .sort();
    expect(userCols).toEqual(["email", "id", "name"]);

    const postCols = schema.columns
      .filter((c) => c.tableName === "Post")
      .map((c) => c.columnName)
      .sort();
    expect(postCols).toEqual(["authorId", "id", "title"]);
  });

  it("detecta nulabilidad, longitud y tipos", () => {
    const email = schema.columns.find((c) => c.tableName === "users" && c.columnName === "email");
    expect(email?.dataType).toBe("varchar");
    expect(email?.maxLength).toBe(180);
    expect(email?.isNullable).toBe("NO");

    const name = schema.columns.find((c) => c.tableName === "users" && c.columnName === "name");
    expect(name?.isNullable).toBe("YES");
  });

  it("detecta claves primarias (@id)", () => {
    const pkTables = schema.primaryKeys.map((p) => `${p.tableName}.${p.columnName}`).sort();
    expect(pkTables).toEqual(["Post.id", "users.id"]);
  });

  it("detecta claves foráneas resolviendo la tabla referenciada", () => {
    expect(schema.foreignKeys).toHaveLength(1);
    const fk = schema.foreignKeys[0];
    expect(fk.tableName).toBe("Post");
    expect(fk.columnName).toBe("authorId");
    expect(fk.referencedTableName).toBe("users");
    expect(fk.referencedColumnName).toBe("id");
  });

  it("detecta índices unique (@unique) y @@index", () => {
    const unique = schema.indexes.find((i) => i.isUnique);
    expect(unique?.tableName).toBe("users");
    expect(unique?.columnName).toBe("email");

    const idx = schema.indexes.find((i) => !i.isUnique);
    expect(idx?.tableName).toBe("Post");
    expect(idx?.columnName).toBe("authorId");
  });
});
