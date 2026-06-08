import { z } from 'zod';

export const indexSchema = z.object({
  schema_name: z.string(),
  table_name: z.string(),
  index_name: z.string(),
  is_unique: z.boolean().optional(),
  index_type: z.string().optional(),
  columns: z.string().nullable().optional(),
  definition: z.string().optional(),
});

export type IndexSchema = z.infer<typeof indexSchema>;

