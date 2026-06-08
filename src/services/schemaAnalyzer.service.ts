import { createDatabaseConnection } from '../database/connection';
import { metadataQueries } from '../database/metadataQueries';
import type { ColumnMetadata, DatabaseClient, IndexMetadata, RelationshipMetadata, TableMetadata } from '../types/database.types';

type ClientFactory = () => Promise<DatabaseClient>;

export class SchemaAnalyzerService {
  constructor(private readonly clientFactory: ClientFactory = createDatabaseConnection) {}

  async readSchema(schema = 'public') {
    const client = await this.clientFactory();

    try {
      const [tables, columns, relationships, indexes] = await Promise.all([
        this.readTablesWithClient(client, schema),
        this.readColumnsWithClient(client, schema),
        this.readRelationshipsWithClient(client, schema),
        this.readIndexesWithClient(client, schema),
      ]);

      return { schema, tables, columns, relationships, indexes };
    } finally {
      await client.close();
    }
  }

  async readTables(schema = 'public') {
    const client = await this.clientFactory();

    try {
      return this.readTablesWithClient(client, schema);
    } finally {
      await client.close();
    }
  }

  async readColumns(schema = 'public', tableName?: string) {
    const client = await this.clientFactory();

    try {
      return this.readColumnsWithClient(client, schema, tableName);
    } finally {
      await client.close();
    }
  }

  private async readTablesWithClient(client: DatabaseClient, schema: string) {
    const result = await client.query<TableMetadata>(metadataQueries.tables(client.engine), { schema });
    return result.rows;
  }

  private async readColumnsWithClient(client: DatabaseClient, schema: string, tableName?: string) {
    const result = await client.query<ColumnMetadata>(metadataQueries.columns(client.engine), {
      schema,
      tableName: tableName ?? null,
    });
    return result.rows;
  }

  private async readRelationshipsWithClient(client: DatabaseClient, schema: string) {
    const result = await client.query<RelationshipMetadata>(metadataQueries.relationships(client.engine), { schema });
    return result.rows;
  }

  private async readIndexesWithClient(client: DatabaseClient, schema: string) {
    const result = await client.query<IndexMetadata>(metadataQueries.indexes(client.engine), { schema });
    return result.rows;
  }
}

export const schemaAnalyzerService = new SchemaAnalyzerService();

