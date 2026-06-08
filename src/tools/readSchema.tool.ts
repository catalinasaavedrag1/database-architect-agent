import { schemaAnalyzerService } from '../services/schemaAnalyzer.service';
import type { ToolDefinition } from '../types/tool.types';

export const readSchemaTool: ToolDefinition = {
  name: 'read_schema',
  description: 'Read tables, columns, relationships, and indexes for a database schema.',
  inputSchema: {
    type: 'object',
    properties: {
      schema: { type: 'string', default: 'public' },
    },
  },
  async handler(input) {
    return schemaAnalyzerService.readSchema(String(input.schema ?? 'public'));
  },
};

