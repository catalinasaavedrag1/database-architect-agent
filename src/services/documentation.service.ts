import { schemaAnalyzerService } from './schemaAnalyzer.service';

export class DocumentationService {
  async documentSchema(schema = 'public') {
    const snapshot = await schemaAnalyzerService.readSchema(schema);

    const lines = [
      `# Database Schema: ${schema}`,
      '',
      '## Tables',
      ...snapshot.tables.map((table) => `- ${table.schema_name}.${table.table_name} (${table.table_type})`),
      '',
      '## Columns',
      ...snapshot.columns.map(
        (column) =>
          `- ${column.schema_name}.${column.table_name}.${column.column_name}: ${column.data_type}, nullable=${column.is_nullable}`,
      ),
      '',
      '## Relationships',
      ...snapshot.relationships.map(
        (relationship) =>
          `- ${relationship.table_name}.${relationship.column_name} -> ${relationship.referenced_table_name}.${relationship.referenced_column_name}`,
      ),
      '',
      '## Indexes',
      ...snapshot.indexes.map((index) => `- ${index.table_name}.${index.index_name}`),
    ];

    return lines.join('\n');
  }
}

export const documentationService = new DocumentationService();

