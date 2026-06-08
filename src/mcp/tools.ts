import { documentSchemaTool } from '../tools/documentSchema.tool';
import { explainQueryTool } from '../tools/explainQuery.tool';
import { generateMigrationTool } from '../tools/generateMigration.tool';
import { readColumnsTool } from '../tools/readColumns.tool';
import { readIndexesTool } from '../tools/readIndexes.tool';
import { readRelationshipsTool } from '../tools/readRelationships.tool';
import { readSchemaTool } from '../tools/readSchema.tool';
import { readTablesTool } from '../tools/readTables.tool';
import { suggestIndexesTool } from '../tools/suggestIndexes.tool';
import { validateSqlTool } from '../tools/validateSql.tool';

export const tools = [
  readSchemaTool,
  readTablesTool,
  readColumnsTool,
  readRelationshipsTool,
  readIndexesTool,
  explainQueryTool,
  validateSqlTool,
  suggestIndexesTool,
  generateMigrationTool,
  documentSchemaTool,
];

