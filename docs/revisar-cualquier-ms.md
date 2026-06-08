# Revisar y migrar cualquier microservicio

El agente es **genérico**: puede revisar cualquier microservicio sin estar atado
a su propia base de datos. El endpoint `POST /agent/analyze` resuelve el esquema
a analizar desde **cuatro fuentes**, en este orden de prioridad:

| Prioridad | Campo del body   | Para qué sirve                                                        |
| --------- | ---------------- | --------------------------------------------------------------------- |
| 1         | `schema`         | Metadata ya introspectada (`FullDatabaseSchema`). Universal.          |
| 2         | `prismaSchema`   | Contenido de un `schema.prisma`. Se parsea automáticamente.           |
| 3         | `sqlServer`      | Conexión read-only a un ms en SQL Server: se introspecta al vuelo.    |
| 4         | `includeSchema`  | Lee la **BD propia** del agente (comportamiento por defecto).         |

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

## 3. Migrar SQL Server → PostgreSQL/Prisma

Misma llamada que el caso 2, pero pidiéndolo en la pregunta. El agente usa el
esquema **real** de SQL Server como base y propone el modelo destino:

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

## Notas

- El agente nunca **persiste** el esquema recibido; lo usa solo para construir
  el prompt de análisis.
- La latencia depende de Claude; usa timeouts y, si revisas en CI, hazlo en un
  step aparte (no en el hot path de una request de usuario).
