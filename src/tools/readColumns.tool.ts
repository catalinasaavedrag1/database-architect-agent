import { schemaAnalyzerService } from '../services/schemaAnalyzer.service';
import type { ToolDefinition } from '../types/tool.types';

export const readColumnsTool: ToolDefinition = {
  name: 'read_columns',
  description: 'Read column metadata for a schema or single table.',
  inputSchema: {
    type: 'object',
    properties: {
      schema: { type: 'string', default: 'public' },
      tableName: { type: 'string' },
    },
  },
  async handler(input) {
    return schemaAnalyzerService.readColumns(
      String(input.schema ?? 'public'),
      typeof input.tableName === 'string' ? input.tableName : undefined,
    );
  },
};

