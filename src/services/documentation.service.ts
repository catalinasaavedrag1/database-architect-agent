import { documentSchemaTool } from '../tools/documentSchema.tool';

export class DocumentationService {
  async documentSchema() {
    return documentSchemaTool();
  }
}

export const documentationService = new DocumentationService();
