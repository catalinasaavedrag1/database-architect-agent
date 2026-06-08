import { readColumnsTool } from '../tools/readColumns.tool';
import { readIndexesTool } from '../tools/readIndexes.tool';
import { readRelationshipsTool } from '../tools/readRelationships.tool';
import { readSchemaTool } from '../tools/readSchema.tool';
import { readTablesTool } from '../tools/readTables.tool';

export class SchemaAnalyzerService {
  async readSchema(schema = 'public') {
    const snapshot = await readSchemaTool();
    return { schema, ...snapshot };
  }

  async readTables(schema = 'public') {
    return readTablesTool({ schemaName: schema });
  }

  async readColumns(schema = 'public', tableName?: string) {
    return readColumnsTool({ schemaName: schema, tableName });
  }

  async readRelationships(schema = 'public', tableName?: string) {
    return readRelationshipsTool({ schemaName: schema, tableName });
  }

  async readIndexes(schema = 'public', tableName?: string) {
    return readIndexesTool({ schemaName: schema, tableName });
  }
}

export const schemaAnalyzerService = new SchemaAnalyzerService();
