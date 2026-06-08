import { readIndexesTool } from '../tools/readIndexes.tool';
import { FullDatabaseSchema } from '../tools/readSchema.tool';

export class IndexAnalyzerService {
  async readIndexes(schema = 'public') {
    return readIndexesTool({ schemaName: schema });
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

export interface IndexAnalysisResult {
  tablesWithoutIndexes: string[];
  duplicatedIndexNames: string[];
  indexedTables: string[];
}

export function analyzeIndexes(schema: FullDatabaseSchema): IndexAnalysisResult {
  const indexedTables = new Set<string>();
  const indexNameCount = new Map<string, number>();

  for (const index of schema.indexes) {
    const tableKey = `${index.schemaName}.${index.tableName}`;
    const indexKey = `${tableKey}.${index.indexName}`;

    indexedTables.add(tableKey);
    indexNameCount.set(indexKey, (indexNameCount.get(indexKey) ?? 0) + 1);
  }

  const tablesWithoutIndexes = schema.tables
    .map((table) => `${table.schemaName}.${table.tableName}`)
    .filter((tableKey) => !indexedTables.has(tableKey));

  const duplicatedIndexNames = Array.from(indexNameCount.entries())
    .filter(([, count]) => count > 1)
    .map(([indexName]) => indexName);

  return {
    tablesWithoutIndexes,
    duplicatedIndexNames,
    indexedTables: Array.from(indexedTables),
  };
}
