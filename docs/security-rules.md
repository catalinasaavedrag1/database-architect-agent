# Reglas de seguridad

Este agente es **read-first**: prioriza la lectura y trata cualquier mutación
como una operación que requiere aprobación humana explícita.

## Reglas

- **Usa credenciales de solo lectura por defecto.** El usuario de base de datos
  configurado en `.env` no debería tener permisos de escritura.
- **Valida el SQL antes de ejecutarlo.** Toda consulta pasa por `SqlGuard`
  (`src/safety/sqlGuard.ts`), que solo permite `SELECT` / `WITH`.
- **Rechaza sentencias múltiples** en las herramientas de solo lectura (el
  carácter `;` y los comentarios `--` / `/* */` se marcan como sospechosos).
- **Bloquea SQL destructivo** salvo que se agregue un flujo de aprobación
  explícito y un camino de ejecución separado.
- **Trata la salida de migraciones como un borrador**, nunca como un comando a
  ejecutar automáticamente.
- **Mantén los secretos fuera** de los prompts, logs y documentación generada
  (API keys, contraseñas, cadenas de conexión, etc.).

## Palabras clave y patrones bloqueados

`SqlGuard` rechaza una consulta si detecta cualquiera de estos casos:

- **Palabras clave destructivas:** `DROP`, `DELETE`, `TRUNCATE`, `ALTER`,
  `UPDATE`, `INSERT`, `MERGE`, `CREATE`, `EXEC`, `EXECUTE`, `GRANT`, `REVOKE`,
  `DENY`.
- **Patrones sospechosos:** comentarios (`--`, `/*`, `*/`), múltiples sentencias
  (`;`), procedimientos extendidos (`xp_`), `sp_configure`, `OPENROWSET`,
  `OPENDATASOURCE`.
- **No empieza con `SELECT` ni `WITH`** → no se considera solo lectura.

## Ejemplos

Consulta **permitida** (`isAllowed: true`, `riskLevel: "SAFE"`):

```sql
SELECT id, status FROM orders WHERE status = 'open';
```

Consulta **bloqueada** (`isAllowed: false`, `riskLevel: "DANGEROUS"`):

```sql
DELETE FROM orders WHERE id = 10;
-- Motivo: palabra clave destructiva detectada (DELETE) y requiere aprobación humana
```

Llamada de bajo nivel desde código:

```ts
import { validateReadOnlySql, assertReadOnlySql } from "../safety/sqlGuard";

const result = validateReadOnlySql("SELECT * FROM customers");
// result.isAllowed === true

assertReadOnlySql("DROP TABLE customers");
// lanza: "SQL query blocked by SqlGuard: ..."
```
