import { readRelationshipsTool } from '../tools/readRelationships.tool';

export class RelationshipAnalyzerService {
  async readRelationships(schema = 'public') {
    return readRelationshipsTool({ schemaName: schema });
  }
}

export const relationshipAnalyzerService = new RelationshipAnalyzerService();
