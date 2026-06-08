import { documentationService } from '../services/documentation.service';
import type { ToolDefinition } from '../types/tool.types';

export const documentSchemaTool: ToolDefinition = {
  name: 'document_schema',
  description: 'Generate markdown documentation for a database schema.',
  inputSchema: {
    type: 'object',
    properties: {
      schema: { type: 'string', default: 'public' },
    },
  },
  async handler(input) {
    return documentationService.documentSchema(String(input.schema ?? 'public'));
  },
};

