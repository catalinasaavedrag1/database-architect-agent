# Revisar y migrar cualquier microservicio

El agente es **genérico**: puede revisar cualquier microservicio sin estar atado
a su propia base de datos. El endpoint `POST /agent/analyze` resuelve el esquema
a analizar desde **cuatro fuentes**, en este orden de prioridad:

| Prioridad | Campo del body   | Para qué sirve                                                        |
| --------- | ---------------- | --------------------------------------------------------------------- |
| 1         | `schema`         | Metadata ya introspectada (`FullDatabaseSchema`). Universal.          |
| 2         | `prismaSchema`   | Contenido de un `schema.prisma`. Se parsea automáticamente.           |
| 3         | `sqlDdl`         | Script DDL de SQL Server (`CREATE TABLE`...). Se parsea automáticamente. |
| 4         | `sqlServer`      | Conexión read-only a un ms en SQL Server: se introspecta al vuelo.    |
| 5         | `includeSchema`  | Lee la **BD propia** del agente (comportamiento por defecto).         |

Campos comunes: `userQuestion` (requerido) y `serviceName` (opcional, contexto).

## 1. Microservicio con Prisma (PostgreSQL)

El propio ms (o un step de CI) envía su `schema.prisma`:

```ts
import { readFileSync } from "node:fs";

const prismaSchema = readFileSync("prisma/schema.prisma", "utf8");

await fetch(`${AGENT_URL}/agent/analyze`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    serviceName: "orders-service",
    userQuestion: "Revisa límites de dominio, relaciones y normalización.",
    prismaSchema,
  }),
});
```

## 2. Microservicio solo en SQL Server

Se le pasan credenciales **read-only** y el agente introspecta y cierra la
conexión solo:

```bash
curl -X POST http://database-architect-agent:3000/agent/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "legacy-inventory",
    "userQuestion": "Revisa el modelo y propón mejoras.",
    "sqlServer": {
      "host": "10.0.0.12", "port": 1433, "database": "Inventory",
      "user": "readonly", "password": "***", "encrypt": false, "trustCert": true
    }
  }'
```

## 2b. Microservicio legacy del que solo tienes el `.sql`

Si no tienes acceso a la BD pero sí el script DDL, mándalo en `sqlDdl`:

```jsonc
{
  "serviceName": "legacy-inventory",
  "userQuestion": "Revisa el modelo y detecta tablas que mezclan responsabilidades.",
  "sqlDdl": "CREATE TABLE dbo.Orders ( OrderId INT PRIMARY KEY, ... );"
}
```

## 3. Migrar SQL Server → PostgreSQL/Prisma

Misma llamada que el caso 2 (o 2b con `sqlDdl`), pero pidiéndolo en la pregunta.
El agente usa el esquema **real** de SQL Server como base y propone el modelo
destino:

```jsonc
{
  "serviceName": "legacy-inventory",
  "userQuestion": "Migra este esquema de SQL Server a PostgreSQL con Prisma. Entrega el schema.prisma destino, el DDL y el plan de migración en fases (expand-contract).",
  "sqlServer": { "host": "...", "database": "Inventory", "user": "readonly", "password": "***" }
}
```

> La salida de migración es un **borrador** y se marca como que requiere
> aprobación humana. Ver `docs/security-rules.md`.

## 4. Metadata ya introspectada (universal)

Si introspectas el esquema por tu cuenta (otro motor, dump, etc.), envíalo tal
cual en `schema` con la forma `FullDatabaseSchema`
(`tables`, `columns`, `primaryKeys`, `foreignKeys`, `indexes`).

## Autenticación servicio-a-servicio

Si defines `INTERNAL_API_KEY`, los endpoints `/tools` y `/agent/analyze` exigen
el header `x-internal-api-key`; sin él responden `401`. `/health` queda siempre
abierto. Si la variable no está definida, los endpoints quedan abiertos (solo
para desarrollo) y el servidor registra una advertencia al arrancar.

```bash
curl -X POST http://database-architect-agent:3000/agent/analyze \
  -H "Content-Type: application/json" \
  -H "x-internal-api-key: $INTERNAL_API_KEY" \
  -d '{ "serviceName": "orders-service", "userQuestion": "...", "prismaSchema": "..." }'
```

## Levantar el agente como servicio

`npm run start` (o `node dist/src/index.js`) arranca el servidor HTTP en `PORT`
(default `3000`). En `docker-compose` agrégalo como un servicio más para que los
demás lo alcancen por hostname.

## Notas

- El agente nunca **persiste** el esquema recibido; lo usa solo para construir
  el prompt de análisis.
- La latencia depende de Claude; usa timeouts y, si revisas en CI, hazlo en un
  step aparte (no en el hot path de una request de usuario).
