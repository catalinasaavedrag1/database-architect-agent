import { schemaAnalyzerService } from '../services/schemaAnalyzer.service';
import type { ToolDefinition } from '../types/tool.types';

export const readTablesTool: ToolDefinition = {
  name: 'read_tables',
  description: 'Read table metadata for a schema.',
  inputSchema: {
    type: 'object',
    properties: {
      schema: { type: 'string', default: 'public' },
    },
  },
  async handler(input) {
    return schemaAnalyzerService.readTables(String(input.schema ?? 'public'));
  },
};

