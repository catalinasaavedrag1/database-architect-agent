# Dominios de base de datos

Usa este documento para mapear los dominios de negocio a los límites de
propiedad (ownership) de la base de datos. La idea es dejar claro **qué equipo
es dueño de qué datos**, cuál es la fuente de verdad y quién depende de quién,
para evitar acoplamientos peligrosos entre servicios.

## Campos recomendados por dominio

- **Nombre del dominio** — el área de negocio (p. ej. `Pedidos`, `Clientes`).
- **Equipo dueño** — quién mantiene y evoluciona el esquema.
- **Tablas críticas** — las tablas centrales del dominio.
- **Sistema fuente de verdad** — dónde vive el dato autoritativo.
- **Dependencias upstream** — de qué dominios/sistemas consume datos.
- **Consumidores downstream** — quién consume los datos de este dominio.
- **Requisitos de retención de datos** — cuánto tiempo se conservan y por qué.
- **Riesgos operativos** — puntos sensibles (volumen, PII, picos de carga, etc.).

## Ejemplo de ficha de dominio

| Campo                     | Valor                                                       |
| ------------------------- | ----------------------------------------------------------- |
| Nombre del dominio        | Pedidos (Orders)                                            |
| Equipo dueño              | Equipo de Fulfillment                                       |
| Tablas críticas           | `orders`, `order_items`, `shipments`                        |
| Sistema fuente de verdad  | Servicio de Pedidos (base de datos `orders_db`)             |
| Dependencias upstream     | Clientes (`customers`), Catálogo (`products`)               |
| Consumidores downstream   | Facturación, Analítica, Notificaciones                      |
| Retención de datos        | 7 años (requisito contable/legal)                           |
| Riesgos operativos        | Alto volumen en campañas; contiene datos personales (PII)   |

## Buenas prácticas

- Cada dominio es **dueño de su propia base de datos**; no consultes la base de
  datos de otro dominio directamente. Comunícate vía API o eventos.
- Documenta la fuente de verdad para cada entidad compartida y evita
  duplicaciones sin un dueño claro.
- Marca explícitamente las tablas con datos personales (PII) y sus reglas de
  retención.
