import { getDbConnection } from "../database/connection";

export interface HealthStatus {
  status: "ok" | "error";
  database: "ok" | "error";
  timestamp: string;
  error?: string;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  try {
    const pool = await getDbConnection();
    await pool.request().query("SELECT 1 AS ok");

    return {
      status: "ok",
      database: "ok",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      database: "error",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
