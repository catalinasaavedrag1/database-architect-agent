import { relationshipAnalyzerService } from '../services/relationshipAnalyzer.service';
import type { ToolDefinition } from '../types/tool.types';

export const readRelationshipsTool: ToolDefinition = {
  name: 'read_relationships',
  description: 'Read foreign-key relationship metadata for a schema.',
  inputSchema: {
    type: 'object',
    properties: {
      schema: { type: 'string', default: 'public' },
    },
  },
  async handler(input) {
    return relationshipAnalyzerService.readRelationships(String(input.schema ?? 'public'));
  },
};

