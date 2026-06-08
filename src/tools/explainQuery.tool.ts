import sql from "mssql";
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

  // `SET SHOWPLAN_XML ON`, the analysed query, and `SET SHOWPLAN_XML OFF` must
  // all run on the SAME physical connection. A pooled `pool.request()` can hand
  // out a different connection per call, which would leave a connection stuck in
  // plan-only mode. A transaction pins one connection for its whole lifetime, so
  // we route every batch through it. Under SHOWPLAN_XML the query is only
  // compiled (never executed), so the transaction does no data work.
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  const request = transaction.request();

  try {
    await request.batch("SET SHOWPLAN_XML ON;");

    const result = await request.batch(input.query);
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
    try {
      await request.batch("SET SHOWPLAN_XML OFF;");
    } catch {
      // Best effort: the connection is released when the transaction settles.
    }

    await transaction
      .commit()
      .catch(() => transaction.rollback().catch(() => undefined));
  }
}
