import { z } from 'zod';

export const relationshipSchema = z.object({
  constraint_name: z.string(),
  schema_name: z.string(),
  table_name: z.string(),
  column_name: z.string(),
  referenced_table_name: z.string(),
  referenced_column_name: z.string(),
});

export type RelationshipSchema = z.infer<typeof relationshipSchema>;

