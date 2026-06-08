import { createDatabaseConnection } from '../database/connection';
import { metadataQueries } from '../database/metadataQueries';
import type { DatabaseClient, IndexMetadata } from '../types/database.types';

type ClientFactory = () => Promise<DatabaseClient>;

export class IndexAnalyzerService {
  constructor(private readonly clientFactory: ClientFactory = createDatabaseConnection) {}

  async readIndexes(schema = 'public') {
    const client = await this.clientFactory();

    try {
      const result = await client.query<IndexMetadata>(metadataQueries.indexes(client.engine), { schema });
      return result.rows;
    } finally {
      await client.close();
    }
  }

  async suggestIndexes(sqlText: string, schema = 'public') {
    const whereColumns = this.extractWhereColumns(sqlText);
    const joinColumns = this.extractJoinColumns(sqlText);

    return {
      schema,
      candidates: [...new Set([...whereColumns, ...joinColumns])].map((column) => ({
        column,
        reason: joinColumns.includes(column)
          ? 'Column appears in a JOIN predicate.'
          : 'Column appears in a WHERE predicate.',
        caution: 'Validate selectivity and write overhead before creating this index.',
      })),
    };
  }

  private extractWhereColumns(sqlText: string) {
    const matches = [...sqlText.matchAll(/\bwhere\b([\s\S]*?)(?:\bgroup\s+by\b|\border\s+by\b|\blimit\b|$)/gi)];
    return matches.flatMap((match) => this.extractColumnReferences(match[1] ?? ''));
  }

  private extractJoinColumns(sqlText: string) {
    const matches = [...sqlText.matchAll(/\bon\b([\s\S]*?)(?:\bjoin\b|\bwhere\b|\bgroup\s+by\b|\border\s+by\b|$)/gi)];
    return matches.flatMap((match) => this.extractColumnReferences(match[1] ?? ''));
  }

  private extractColumnReferences(fragment: string) {
    return [...fragment.matchAll(/\b[a-zA-Z_][a-zA-Z0-9_]*\.([a-zA-Z_][a-zA-Z0-9_]*)\b/g)].map((match) => match[1]);
  }
}

export const indexAnalyzerService = new IndexAnalyzerService();

