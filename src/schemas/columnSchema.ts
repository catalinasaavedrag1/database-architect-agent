import { z } from 'zod';

export const columnSchema = z.object({
  schema_name: z.string(),
  table_name: z.string(),
  column_name: z.string(),
  data_type: z.string(),
  is_nullable: z.string(),
  column_default: z.string().nullable().optional(),
  ordinal_position: z.number().optional(),
});

export type ColumnSchema = z.infer<typeof columnSchema>;

