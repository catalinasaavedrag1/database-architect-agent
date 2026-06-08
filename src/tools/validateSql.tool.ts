import { performanceAnalyzerService } from '../services/performanceAnalyzer.service';
import type { ToolDefinition } from '../types/tool.types';

export const validateSqlTool: ToolDefinition = {
  name: 'validate_sql',
  description: 'Validate whether SQL is safe for read-only execution.',
  inputSchema: {
    type: 'object',
    required: ['sql'],
    properties: {
      sql: { type: 'string' },
    },
  },
  async handler(input) {
    return performanceAnalyzerService.validateSql(String(input.sql ?? ''));
  },
};

