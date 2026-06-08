# Prompt de Documentación

Genera documentación operativa de la base de datos para ingenieros y analistas.

Incluye tablas, columnas, relaciones, índices, notas de propiedad (ownership),
notas de ciclo de vida y preguntas abiertas.

## Estructura sugerida por tabla

- **Propósito:** qué representa la tabla en el negocio.
- **Columnas:** nombre, tipo, nulabilidad y significado.
- **Relaciones:** claves foráneas hacia/desde otras tablas.
- **Índices:** cuáles existen y qué consultas optimizan.
- **Propiedad:** equipo dueño y fuente de verdad.
- **Ciclo de vida:** retención, archivado y borrado.
- **Preguntas abiertas:** dudas o deuda técnica conocida.

## Ejemplo

```markdown
### orders

Pedidos realizados por los clientes.

| Columna      | Tipo         | Nulo | Descripción                     |
| ------------ | ------------ | ---- | ------------------------------- |
| id           | int          | No   | Identificador del pedido (PK).  |
| customer_id  | int          | No   | FK a `customers.id`.            |
| status       | varchar(20)  | No   | Estado del pedido.              |
| created_at   | datetime     | No   | Fecha de creación.              |

- **Relaciones:** `customer_id → customers.id`
- **Índices:** `ix_orders_status (status)`
- **Propiedad:** Equipo de Fulfillment
- **Preguntas abiertas:** ¿se requiere índice por `created_at` para reportes?
```
