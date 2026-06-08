# Prompt de Optimización de SQL

Analiza el plan de la consulta, los predicados, los joins, las operaciones de
ordenamiento y las estimaciones de filas devueltas. Sugiere cambios de índices
solo cuando el beneficio de lectura esperado justifique el costo de escritura y
almacenamiento.

Nunca recomiendes un índice de producción sin validarlo antes en staging.

## Qué analizar

- **Predicados:** ¿las columnas del `WHERE` están indexadas? ¿hay funciones que
  impiden usar el índice (p. ej. `WHERE YEAR(fecha) = 2026`)?
- **Joins:** ¿las claves de unión tienen índices en ambos lados?
- **Ordenamientos:** ¿los `ORDER BY` / `GROUP BY` provocan sorts costosos?
- **Estimación de filas:** ¿el plan estima bien la cantidad de filas?
- **Costo total:** un índice acelera lecturas pero ralentiza escrituras.

## Ejemplo

Consulta lenta por filtro de estado sin índice:

```sql
SELECT id, total FROM orders WHERE status = 'open';
```

Índice sugerido (validar primero en staging):

```sql
CREATE INDEX ix_orders_status ON orders (status) INCLUDE (total);
```

> Solo recomiéndalo si las lecturas por `status` son frecuentes y el costo de
> escritura es aceptable.
