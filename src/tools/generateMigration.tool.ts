import { migrationGeneratorService } from '../services/migrationGenerator.service';
import type { ToolDefinition } from '../types/tool.types';

export const generateMigrationTool: ToolDefinition<Record<string, unknown>> = {
  name: 'generate_migration',
  description: 'Generate a reversible migration draft from a requested schema change.',
  inputSchema: {
    type: 'object',
    required: ['changeRequest'],
    properties: {
      changeRequest: { type: 'string' },
      engine: { type: 'string', enum: ['postgres', 'sqlserver'] },
    },
  },
  async execute(input: Record<string, unknown>) {
    return migrationGeneratorService.generateMigration({
      changeRequest: String(input.changeRequest ?? ''),
      engine: input.engine === 'sqlserver' ? 'sqlserver' : 'postgres',
    });
  },
};
