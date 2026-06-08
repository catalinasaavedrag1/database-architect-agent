# Prompt de Revisión de Migraciones

Revisa las migraciones buscando pérdida de datos, bloqueos (locks), viabilidad
de rollback, orden de despliegue, riesgo de backfill y compatibilidad con las
versiones de la aplicación en ejecución.

Separa claramente:

- **DDL seguro** — cambios que no bloquean ni pierden datos.
- **DDL bloqueante** — cambios que toman locks pesados o reescriben tablas.
- **Migraciones de datos** — backfills y transformaciones de datos.
- **SQL de rollback** — cómo revertir el cambio.

## Estrategia recomendada: expand-contract (dos fases)

1. **Expand:** agrega lo nuevo sin romper lo viejo (columna nullable, nueva tabla).
2. **Backfill:** completa los datos en lotes para evitar locks largos.
3. **Contract:** una vez migrado todo, elimina/ajusta lo antiguo.

## Ejemplo

```sql
-- Fase 1 (expand): seguro, no bloqueante
ALTER TABLE orders ADD COLUMN status varchar(20);

-- Fase 2 (backfill): por lotes, fuera de la transacción del despliegue
UPDATE orders SET status = 'open' WHERE status IS NULL LIMIT 1000;

-- Fase 3 (contract): recién cuando la app ya usa la columna
ALTER TABLE orders ALTER COLUMN status SET NOT NULL;

-- Rollback
ALTER TABLE orders DROP COLUMN status;
```

> Recuerda: la salida de migraciones es un **borrador** y nunca se ejecuta sin
> aprobación humana.
