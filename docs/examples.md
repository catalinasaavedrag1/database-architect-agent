# Examples

## Validate SQL

```json
{
  "sql": "select * from customers where customer_id = 10"
}
```

## Suggest Indexes

```json
{
  "schema": "public",
  "sql": "select * from orders o join customers c on c.id = o.customer_id where o.status = 'open'"
}
```

## Generate Migration Draft

```json
{
  "engine": "postgres",
  "changeRequest": "Add an orders.status column with a default value"
}
```

