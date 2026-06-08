import { readRelationshipsTool } from '../tools/readRelationships.tool';
import { FullDatabaseSchema } from '../tools/readSchema.tool';

export class RelationshipAnalyzerService {
  async readRelationships(schema = 'public') {
    return readRelationshipsTool({ schemaName: schema });
  }
}

export const relationshipAnalyzerService = new RelationshipAnalyzerService();

export interface RelationshipAnalysisResult {
  totalRelationships: number;
  orphanRiskTables: string[];
  highlyConnectedTables: Array<{
    tableName: string;
    relationshipCount: number;
  }>;
}

export function analyzeRelationships(
  schema: FullDatabaseSchema
): RelationshipAnalysisResult {
  const relationshipCount = new Map<string, number>();

  for (const table of schema.tables) {
    relationshipCount.set(`${table.schemaName}.${table.tableName}`, 0);
  }

  for (const fk of schema.foreignKeys) {
    const source = `${fk.schemaName}.${fk.tableName}`;
    const target = `${fk.referencedSchemaName}.${fk.referencedTableName}`;

    relationshipCount.set(source, (relationshipCount.get(source) ?? 0) + 1);
    relationshipCount.set(target, (relationshipCount.get(target) ?? 0) + 1);
  }

  const orphanRiskTables = Array.from(relationshipCount.entries())
    .filter(([, count]) => count === 0)
    .map(([tableName]) => tableName);

  const highlyConnectedTables = Array.from(relationshipCount.entries())
    .filter(([, count]) => count >= 5)
    .map(([tableName, count]) => ({
      tableName,
      relationshipCount: count,
    }))
    .sort((a, b) => b.relationshipCount - a.relationshipCount);

  return {
    totalRelationships: schema.foreignKeys.length,
    orphanRiskTables,
    highlyConnectedTables,
  };
}
