# Database Architect Agent

**Database Architect Agent** es un scaffold en TypeScript para un asistente
potenciado por Claude que inspecciona metadata de SQL Server (y PostgreSQL),
valida y explica SQL de solo lectura, sugiere índices, redacta borradores de
migraciones y genera documentación de esquemas.

El proyecto es **read-first** (lectura primero): el SQL destructivo se detecta y
se bloquea, las acciones que mutan datos requieren aprobación explícita y se
espera que los clientes de base de datos se ejecuten con credenciales de solo
lectura por defecto.

## Stack

- **TypeScript** (Node.js >= 20)
- Servidor HTTP con **Express** que expone el agente y las herramientas
- **Registro de herramientas estilo MCP** (`createMcpServer`) sobre un contrato
  tipado `ToolDefinition`
- Lectores de metadata para **SQL Server** (`mssql`) y **PostgreSQL** (`pg`)
- Orquestación de prompts de **Claude** vía `@anthropic-ai/sdk`
- Esquemas **Zod** para la metadata de base de datos
- Guardas de seguridad SQL (`SqlGuard`) y una política de permisos/aprobación
- **Vitest** para los tests

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev
```

`npm run dev` ejecuta `src/index.ts`, que **levanta el servidor HTTP** (modo
servicio) en `PORT`. Para usar el agente de forma programática sin servidor,
importa `runDatabaseArchitect()` / `databaseArchitectAgent()` desde la raíz del
paquete.

## Configuración

Toda la configuración se lee desde variables de entorno (ver `.env.example`).

### Base de datos (SQL Server)

```text
DB_HOST=localhost
DB_PORT=1433
DB_NAME=NombreDeTuBaseDeDatos
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

### Claude

```text
CLAUDE_API_KEY=sk-ant-...        # también se acepta ANTHROPIC_API_KEY
CLAUDE_MODEL=claude-3-5-sonnet-latest
```

### Servidor

```text
PORT=3000
NODE_ENV=development
```

## Scripts

- `npm run dev` — ejecuta el entrypoint TypeScript (`src/index.ts`)
- `npm run build` — compila TypeScript en `dist/`
- `npm run start` — ejecuta la salida compilada (`dist/src/index.js`)
- `npm run typecheck` — corre TypeScript sin emitir archivos
- `npm test` — corre Vitest (las carpetas de tests están preparadas en `tests/`)

## API HTTP

`createApp()` / `startHttpServer()` exponen:

| Método | Ruta             | Descripción                                          |
| ------ | ---------------- | ---------------------------------------------------- |
| GET    | `/health`        | Estado del servicio y del entorno                    |
| GET    | `/tools`         | Lista las herramientas MCP registradas y sus schemas |
| POST   | `/tools/:name`   | Invoca una herramienta por nombre con un body JSON   |
| POST   | `/agent/analyze` | Ejecuta el agente arquitecto sobre cualquier ms      |

### Ejemplos de uso

Listar las herramientas disponibles:

```bash
curl http://localhost:3000/tools
```

Validar una consulta de solo lectura:

```bash
curl -X POST http://localhost:3000/tools/validate_sql \
  -H "Content-Type: application/json" \
  -d '{ "query": "SELECT id, status FROM orders WHERE status = '\''open'\''" }'
```

Pedirle un análisis al agente (sobre su propia BD):

```bash
curl -X POST http://localhost:3000/agent/analyze \
  -H "Content-Type: application/json" \
  -d '{ "userQuestion": "Analiza el modelo de datos y detecta problemas de relaciones.", "includeSchema": true }'
```

### Revisar / migrar cualquier microservicio

El agente es genérico: además de su propia BD, `POST /agent/analyze` acepta el
esquema del ms a revisar por una de estas vías (en orden de prioridad):

- `schema` — metadata ya introspectada (`FullDatabaseSchema`). Universal.
- `prismaSchema` — el contenido de un `schema.prisma` (se parsea solo).
- `sqlDdl` — un script DDL de SQL Server (`CREATE TABLE`...), se parsea solo.
- `sqlServer` — conexión read-only a un ms en SQL Server (se introspecta al vuelo).
- `includeSchema` — lee la BD propia del agente (por defecto).

Si defines `INTERNAL_API_KEY`, los endpoints `/tools` y `/agent/analyze` exigen
el header `x-internal-api-key` (auth servicio-a-servicio). `npm run start`
levanta el servidor HTTP en `PORT`.

Útil para auditar servicios Prisma/PostgreSQL **y** migrar servicios legacy de
SQL Server a PostgreSQL/Prisma. Guía completa con ejemplos en
[`docs/revisar-cualquier-ms.md`](docs/revisar-cualquier-ms.md).

## Herramientas

El registro MCP (`src/mcp/tools.ts`) expone las siguientes herramientas:

**Metadata**

- `read_schema` — tablas, columnas, claves primarias/foráneas e índices
- `read_tables` — metadata de tablas (filtra por `schemaName`)
- `read_columns` — metadata de columnas (filtra por `schemaName` / `tableName`)
- `read_relationships` — relaciones de claves foráneas (filtra por `schemaName` / `tableName`)
- `read_indexes` — índices (filtra por `schemaName` / `tableName`)

**Rendimiento**

- `validate_sql` — verifica si una sentencia es segura para análisis de solo lectura
- `explain_query` — devuelve el plan de ejecución estimado de SQL Server (XML)
- `suggest_indexes` — propone índices para una consulta

**Entrega**

- `generate_migration` — redacta un borrador de migración (es un borrador, nunca se ejecuta)
- `document_schema` — genera documentación en Markdown a partir del esquema actual

Ver detalles y ejemplos por herramienta en [`docs/tools.md`](docs/tools.md) y
[`docs/examples.md`](docs/examples.md).

## Estructura del proyecto

```
src/
  agent/         # system prompt, reglas del agente y orquestador del arquitecto
  config/        # configuración de env, base de datos y cliente de Claude
  database/      # clientes SQL Server + PostgreSQL, pool de conexión, queries de metadata
  mcp/           # servidor MCP, registro de herramientas y recursos
  prompts/       # plantillas de prompt de Claude (modelado, optimización, migración, docs)
  safety/        # SqlGuard, detector de queries destructivas, política de permisos/aprobación
  schemas/       # esquemas Zod para tablas, columnas, índices y relaciones
  services/      # análisis de esquema/índices/relaciones/rendimiento, migración y docs
  tools/         # implementaciones de las herramientas del registro MCP
  types/         # definiciones de tipos compartidas
  utils/         # logger, errores y formateo de SQL
  index.ts       # entrypoint CLI + re-exports del paquete
  server.ts      # servidor HTTP Express
docs/            # arquitectura, herramientas, dominios, seguridad y ejemplos
examples/        # ejemplos de uso ejecutables
tests/           # suites de Vitest (agent / safety / services / tools)
```

## Modelo de seguridad

El agente está diseñado para soportar:

- lecturas de esquema
- análisis de metadata
- validación de consultas de solo lectura (`SqlGuard` solo permite `SELECT` / `WITH`)
- planes de ejecución estimados de SQL Server
- sugerencias de índices
- borradores de migraciones
- documentación generada

**No** ejecutará `DROP`, `TRUNCATE`, `ALTER`, `UPDATE`, `DELETE`, `INSERT`,
`MERGE`, `CREATE`, `GRANT`, `REVOKE` ni ejecución procedural (`EXEC` / `xp_` /
`sp_configure`) sin aprobación explícita y un camino de ejecución separado. Las
sentencias múltiples, los comentarios y otros patrones sospechosos también son
bloqueados por la guarda de solo lectura. Ver
[`docs/security-rules.md`](docs/security-rules.md).
