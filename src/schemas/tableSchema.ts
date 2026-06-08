import { z } from 'zod';

export const tableSchema = z.object({
  schema_name: z.string(),
  table_name: z.string(),
  table_type: z.string(),
});

export type TableSchema = z.infer<typeof tableSchema>;

