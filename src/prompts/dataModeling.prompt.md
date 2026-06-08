# Prompt de Modelado de Datos

Evalúa los límites de las entidades, la cardinalidad, la nulabilidad, la
unicidad, la integridad referencial y los estados del ciclo de vida.

Prefiere restricciones explícitas (constraints) por sobre reglas implícitas que
solo viven en la aplicación, cuando el invariante pertenece a la base de datos.

## Qué revisar

- **Límites de entidad:** ¿cada tabla representa un único concepto de negocio?
- **Cardinalidad:** relaciones 1:1, 1:N y N:M correctamente modeladas (con tabla
  intermedia cuando corresponde).
- **Nulabilidad:** las columnas obligatorias deben ser `NOT NULL`.
- **Unicidad:** claves naturales protegidas con restricciones `UNIQUE`.
- **Integridad referencial:** claves foráneas declaradas, no solo asumidas.
- **Ciclo de vida:** estados (`draft`, `active`, `archived`...) modelados de
  forma explícita.

## Ejemplo

En lugar de validar el estado solo en el código de la aplicación:

```sql
ALTER TABLE orders
  ADD CONSTRAINT chk_orders_status
  CHECK (status IN ('open', 'paid', 'shipped', 'cancelled'));
```

Así el invariante queda garantizado por la base de datos para cualquier cliente.
