# Ejemplos

Estos ejemplos muestran los cuerpos JSON que esperan las herramientas. Puedes
enviarlos por el endpoint HTTP `POST /tools/:name` o pasarlos directamente a
`mcpServer.callTool(name, input)`.

> Nota: `validate_sql` y `explain_query` usan el campo `query`, mientras que
> `suggest_indexes` usa `sql`. Respeta el nombre exacto de cada campo.

## Validar SQL (`validate_sql`)

Verifica que la consulta sea de solo lectura antes de usarla.

```json
{
  "query": "SELECT id, status FROM orders WHERE status = 'open'"
}
```

Respuesta esperada (consulta segura):

```json
{
  "result": {
    "isAllowed": true,
    "riskLevel": "SAFE",
    "reasons": ["Query is read-only"],
    "requiresHumanApproval": false
  }
}
```

Si la consulta fuera destructiva (p. ej. `DELETE FROM orders`), la respuesta
tendría `isAllowed: false`, `riskLevel: "DANGEROUS"` y
`requiresHumanApproval: true`.

## Explicar consulta (`explain_query`)

Devuelve el plan de ejecución estimado de SQL Server (XML).

```json
{
  "query": "SELECT * FROM orders WHERE customer_id = 10"
}
```

## Sugerir índices (`suggest_indexes`)

Propone índices candidatos a partir del texto de la consulta y el esquema.

```json
{
  "schema": "public",
  "sql": "SELECT * FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status = 'open'"
}
```

## Generar borrador de migración (`generate_migration`)

Redacta un borrador reversible. Es solo un borrador: revísalo antes de aplicarlo.

```json
{
  "engine": "postgres",
  "changeRequest": "Agregar la columna orders.status con un valor por defecto"
}
```

## Analizar el modelo con el agente (`POST /agent/analyze`)

Pídele al agente arquitecto un diagnóstico usando el esquema real.

```json
{
  "userQuestion": "Analiza el modelo de datos y detecta problemas de relaciones.",
  "includeSchema": true
}
```

El agente responde en el formato estándar:

```text
## Diagnóstico
## Riesgos
## Recomendación
## Modelo propuesto
## SQL sugerido
## Validaciones necesarias
## Observaciones
```
