# Arquitectura

El proyecto se organiza en las siguientes capas:

1. **Puntos de entrada** — `src/index.ts` (CLI + re-exports del paquete) y
   `src/server.ts` (servidor HTTP Express: `/health`, `/tools`, `/tools/:name`,
   `/agent/analyze`).
2. **Capa de agente** — `src/agent/*` construye el system prompt y la
   instrucción del arquitecto. Delega la inspección de la base de datos en las
   herramientas y servicios, y **nunca** ejecuta SQL arbitrario de forma directa.
3. **Registro de herramientas** — `src/mcp/*` (el servidor MCP y la lista de
   herramientas) envuelve las implementaciones de `src/tools/*` detrás de un
   contrato tipado `ToolDefinition`.
4. **Servicios de dominio** — `src/services/*` (análisis de esquema, índices,
   relaciones, rendimiento, migración y documentación).
5. **Adaptadores** — `src/database/*` (clientes SQL Server + PostgreSQL, pool de
   conexión, queries de metadata) y `src/safety/*` (`SqlGuard`, detección de
   queries destructivas, política de permisos/aprobación).
6. **Schemas y tipos** — `src/schemas/*` (Zod) y `src/types/*` describen la
   metadata y los contratos de las herramientas.

## Flujo de datos

```
  Cliente (CLI / HTTP / MCP)
            │
            ▼
   Agente  ó  Herramienta
            │
            ▼
   Servicios de dominio
            │
            ▼
  Adaptadores de base de datos  ──►  SQL Server / PostgreSQL
            │
            ▼
   Capa de seguridad (SqlGuard)  ──►  valida cualquier SQL antes de ejecutarlo
```

Una solicitud entra (por CLI, HTTP o MCP) hacia el agente o una herramienta, que
lee la metadata a través de los adaptadores de base de datos. Cualquier SQL es
validado por la capa de seguridad antes de considerarse para ejecución.

## Ejemplo: cómo se atiende una petición

Cuando llega `POST /agent/analyze` con
`{ "userQuestion": "...", "includeSchema": true }`:

1. El servidor (`src/server.ts`) delega en `DatabaseArchitectAgent.analyze()`.
2. El agente lee el esquema con `read_schema` (si `includeSchema` es `true`).
3. Resume el esquema (tablas, columnas, PKs, FKs, índices) y lo inyecta en la
   instrucción junto con el system prompt.
4. Devuelve `{ systemPrompt, userQuestion, schema, agentInstruction }` lista
   para enviarse a Claude, que responde en el formato estándar
   (`## Diagnóstico`, `## Riesgos`, `## Recomendación`, etc.).
