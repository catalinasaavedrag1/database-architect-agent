import { performanceAnalyzerService } from '../services/performanceAnalyzer.service';
import type { ToolDefinition } from '../types/tool.types';

export const explainQueryTool: ToolDefinition = {
  name: 'explain_query',
  description: 'Run a read-only EXPLAIN plan for a SQL query.',
  inputSchema: {
    type: 'object',
    required: ['sql'],
    properties: {
      sql: { type: 'string' },
    },
  },
  async handler(input) {
    return performanceAnalyzerService.explainQuery(String(input.sql ?? ''));
  },
};

