import { indexAnalyzerService } from '../services/indexAnalyzer.service';
import type { ToolDefinition } from '../types/tool.types';

export const suggestIndexesTool: ToolDefinition<Record<string, unknown>> = {
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
  async execute(input: Record<string, unknown>) {
    return indexAnalyzerService.suggestIndexes(String(input.sql ?? ''), String(input.schema ?? 'public'));
  },
};
