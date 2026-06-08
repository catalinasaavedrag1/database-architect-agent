# Herramientas

Las herramientas se registran en `src/mcp/tools.ts` y se invocan a través del
servidor MCP (`createMcpServer`) o del endpoint HTTP `POST /tools/:name`.

Cada herramienta declara un `inputSchema` (estilo JSON Schema). A continuación
se documentan sus entradas y se incluye un ejemplo de invocación por HTTP.

## Metadata

### `read_schema`

Lee tablas, columnas, claves primarias/foráneas e índices de la metadata.

- **Entradas:** ninguna.

```bash
curl -X POST http://localhost:3000/tools/read_schema \
  -H "Content-Type: application/json" -d '{}'
```

### `read_tables`

Metadata de tablas, opcionalmente filtrada por esquema.

- **Entradas:** `schemaName?` (string)

```bash
curl -X POST http://localhost:3000/tools/read_tables \
  -H "Content-Type: application/json" \
  -d '{ "schemaName": "dbo" }'
```

### `read_columns`

Metadata de columnas, opcionalmente filtrada por esquema o tabla.

- **Entradas:** `schemaName?` (string), `tableName?` (string)

```bash
curl -X POST http://localhost:3000/tools/read_columns \
  -H "Content-Type: application/json" \
  -d '{ "schemaName": "dbo", "tableName": "orders" }'
```

### `read_relationships`

Relaciones de claves foráneas, opcionalmente filtradas por esquema o tabla.

- **Entradas:** `schemaName?` (string), `tableName?` (string)

```bash
curl -X POST http://localhost:3000/tools/read_relationships \
  -H "Content-Type: application/json" \
  -d '{ "tableName": "orders" }'
```

### `read_indexes`

Índices, opcionalmente filtrados por esquema o tabla.

- **Entradas:** `schemaName?` (string), `tableName?` (string)

```bash
curl -X POST http://localhost:3000/tools/read_indexes \
  -H "Content-Type: application/json" \
  -d '{ "tableName": "orders" }'
```

## Rendimiento

### `validate_sql`

Verifica si una sentencia es segura para análisis de solo lectura. Solo se
permiten consultas `SELECT` / `WITH`; se bloquean palabras clave destructivas,
sentencias múltiples y patrones sospechosos.

- **Entradas:** `query` (string, requerido)

```bash
curl -X POST http://localhost:3000/tools/validate_sql \
  -H "Content-Type: application/json" \
  -d '{ "query": "SELECT id, status FROM orders WHERE status = '\''open'\''" }'
```

### `explain_query`

Devuelve el plan de ejecución estimado de SQL Server (XML) para una consulta de
solo lectura.

- **Entradas:** `query` (string, requerido)

```bash
curl -X POST http://localhost:3000/tools/explain_query \
  -H "Content-Type: application/json" \
  -d '{ "query": "SELECT * FROM orders WHERE customer_id = 10" }'
```

### `suggest_indexes`

Propone índices candidatos a partir del texto de la consulta y la metadata del
esquema conocida.

- **Entradas:** `sql` (string, requerido), `schema` (string, por defecto `public`)

```bash
curl -X POST http://localhost:3000/tools/suggest_indexes \
  -H "Content-Type: application/json" \
  -d '{ "schema": "public", "sql": "SELECT * FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = '\''open'\''" }'
```

## Entrega

### `generate_migration`

Genera un borrador de migración reversible a partir de un cambio de esquema
solicitado. La salida es un **borrador**: nunca se ejecuta automáticamente.

- **Entradas:** `changeRequest` (string, requerido), `engine` (`postgres` | `sqlserver`)

```bash
curl -X POST http://localhost:3000/tools/generate_migration \
  -H "Content-Type: application/json" \
  -d '{ "engine": "postgres", "changeRequest": "Agregar la columna orders.status con un valor por defecto" }'
```

### `document_schema`

Genera documentación en Markdown a partir del esquema actual.

- **Entradas:** ninguna.

```bash
curl -X POST http://localhost:3000/tools/document_schema \
  -H "Content-Type: application/json" -d '{}'
```
