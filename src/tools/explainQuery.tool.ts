import { getDbConnection } from "../database/connection";
import { assertReadOnlySql } from "../safety/sqlGuard";

export interface ExplainQueryInput {
  query: string;
}

export interface ExplainQueryOutput {
  query: string;
  estimatedPlanXml: string | null;
  warning?: string;
}

export async function explainQueryTool(
  input: ExplainQueryInput
): Promise<ExplainQueryOutput> {
  assertReadOnlySql(input.query);
  const pool = await getDbConnection();
  const request = pool.request();

  await request.query("SET SHOWPLAN_XML ON;");

  try {
    const result = await request.query(input.query);
    const firstRow = result.recordset?.[0];
    const estimatedPlanXml =
      firstRow && Object.values(firstRow).length > 0
        ? String(Object.values(firstRow)[0])
        : null;

    return {
      query: input.query,
      estimatedPlanXml,
    };
  } finally {
    await pool.request().query("SET SHOWPLAN_XML OFF;");
  }
}
