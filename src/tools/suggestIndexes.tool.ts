import { indexAnalyzerService } from '../services/indexAnalyzer.service';
import type { ToolDefinition } from '../types/tool.types';

export const suggestIndexesTool: ToolDefinition = {
  name: 'suggest_indexes',
  description: 'Suggest candidate indexes from query text and known schema metadata.',
  inputSchema: {
    type: 'object',
    required: ['sql'],
    properties: {
      sql: { type: 'string' },
      schema: { type: 'string', default: 'public' },
    },
  },
  async handler(input) {
    return indexAnalyzerService.suggestIndexes(String(input.sql ?? ''), String(input.schema ?? 'public'));
  },
};

