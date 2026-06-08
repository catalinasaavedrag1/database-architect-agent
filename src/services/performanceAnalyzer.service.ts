import { explainQueryTool } from '../tools/explainQuery.tool';
import { validateReadOnlySql } from '../safety/sqlGuard';

export class PerformanceAnalyzerService {
  validateSql(sqlText: string) {
    return validateReadOnlySql(sqlText);
  }

  async explainQuery(sqlText: string) {
    return explainQueryTool({ query: sqlText });
  }
}

export const performanceAnalyzerService = new PerformanceAnalyzerService();
