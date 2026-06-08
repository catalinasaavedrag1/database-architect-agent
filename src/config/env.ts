import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

function booleanFromEnv(defaultValue: boolean) {
  return z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    if (typeof value === 'string') {
      return ['1', 'true', 'yes', 'y'].includes(value.toLowerCase());
    }

    return value;
  }, z.boolean());
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  ANTHROPIC_API_KEY: z.string().optional(),
  CLAUDE_MODEL: z.string().default('claude-sonnet-4-20250514'),
  CLAUDE_MAX_TOKENS: z.coerce.number().int().positive().default(4096),
  DATABASE_ENGINE: z.enum(['postgres', 'sqlserver']).default('postgres'),
  DATABASE_URL: z.string().optional(),
  DATABASE_SSL: booleanFromEnv(false),
  DATABASE_READ_ONLY: booleanFromEnv(true),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;

