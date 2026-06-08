import { indexAnalyzerService } from '../services/indexAnalyzer.service';
import type { ToolDefinition } from '../types/tool.types';

export const readIndexesTool: ToolDefinition = {
  name: 'read_indexes',
  description: 'Read index metadata for a schema.',
  inputSchema: {
    type: 'object',
    properties: {
      schema: { type: 'string', default: 'public' },
    },
  },
  async handler(input) {
    return indexAnalyzerService.readIndexes(String(input.schema ?? 'public'));
  },
};

