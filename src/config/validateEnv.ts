import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(3000),
  DB_ENGINE: z.enum(["sqlserver", "postgres"]).default("sqlserver"),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(1433),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_ENCRYPT: z.string().default("false"),
  DB_TRUST_CERT: z.string().default("true"),
  // Optional (and tolerant of an empty .env placeholder) so read-only
  // entrypoints (HTTP /tools, the MCP server) can run without it; the Claude
  // client validates the key lazily when the agent is actually invoked.
  CLAUDE_API_KEY: z.string().optional(),
  CLAUDE_MODEL: z.string().default("claude-3-5-sonnet-latest"),
});

export type ValidatedEnv = z.infer<typeof EnvSchema>;

/**
 * Validate the process environment and return the parsed, typed values.
 * Exposed as a function (not a module-level `parse`) so that importing this
 * module never crashes unrelated flows (tests, CLI). Call it explicitly at
 * server startup to fail fast on misconfiguration.
 */
export function validateEnv(source: NodeJS.ProcessEnv = process.env): ValidatedEnv {
  return EnvSchema.parse(source);
}
