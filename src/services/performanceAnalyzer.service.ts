import { createDatabaseConnection } from '../database/connection';
import { metadataQueries } from '../database/metadataQueries';
import { validateReadOnlySql } from '../safety/sqlGuard';

export class PerformanceAnalyzerService {
  validateSql(sqlText: string) {
    return validateReadOnlySql(sqlText);
  }

  async explainQuery(sqlText: string) {
    const validation = validateReadOnlySql(sqlText);

    if (!validation.allowed) {
      return {
        validation,
        plan: null,
      };
    }

    const client = await createDatabaseConnection();

    try {
      const result = await client.query(metadataQueries.explain(client.engine, sqlText));
      return {
        validation,
        engine: client.engine,
        plan: result.rows,
      };
    } finally {
      await client.close();
    }
  }
}

export const performanceAnalyzerService = new PerformanceAnalyzerService();

