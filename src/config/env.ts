import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  database: {
    engine: (process.env.DB_ENGINE === "postgres" ? "postgres" : "sqlserver") as
      | "postgres"
      | "sqlserver",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 1433),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    encrypt: process.env.DB_ENCRYPT === "true",
    trustCert: process.env.DB_TRUST_CERT === "true",
  },
  claude: {
    apiKey: process.env.CLAUDE_API_KEY ?? process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL ?? "claude-3-5-sonnet-latest",
  },
};

export type Env = typeof env;
