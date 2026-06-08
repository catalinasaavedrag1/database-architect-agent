import { createDatabaseConnection } from '../database/connection';
import { metadataQueries } from '../database/metadataQueries';
import type { DatabaseClient, RelationshipMetadata } from '../types/database.types';

type ClientFactory = () => Promise<DatabaseClient>;

export class RelationshipAnalyzerService {
  constructor(private readonly clientFactory: ClientFactory = createDatabaseConnection) {}

  async readRelationships(schema = 'public') {
    const client = await this.clientFactory();

    try {
      const result = await client.query<RelationshipMetadata>(metadataQueries.relationships(client.engine), { schema });
      return result.rows;
    } finally {
      await client.close();
    }
  }
}

export const relationshipAnalyzerService = new RelationshipAnalyzerService();

