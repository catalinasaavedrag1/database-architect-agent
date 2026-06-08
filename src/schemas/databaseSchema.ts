import { z } from 'zod';
import { tableSchema } from './tableSchema';
import { columnSchema } from './columnSchema';
import { indexSchema } from './indexSchema';
import { relationshipSchema } from './relationshipSchema';

export const databaseSchema = z.object({
  schema: z.string(),
  tables: z.array(tableSchema),
  columns: z.array(columnSchema),
  indexes: z.array(indexSchema),
  relationships: z.array(relationshipSchema),
});

export type DatabaseSchema = z.infer<typeof databaseSchema>;

