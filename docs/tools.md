# Tools

## Metadata

- `read_schema` — Reads the full database schema (tables, columns, keys, relationships, indexes).
- `read_tables` — Reads tables, optionally filtered by schema.
- `read_columns` — Reads columns, optionally filtered by schema and table.
- `read_relationships` — Reads foreign-key relationships.
- `read_indexes` — Reads indexes, optionally filtered by schema and table.

## Performance

- `validate_sql` — Validates whether a query is safe and read-only.
- `explain_query` — Returns an estimated SQL Server execution plan for a read-only query.
- `suggest_indexes` — Suggests candidate indexes from query text and schema metadata.

## Delivery

- `generate_migration` — Generates a reversible migration draft (requires approval).
- `document_schema` — Generates markdown documentation for the database schema.
