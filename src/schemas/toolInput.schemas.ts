import { z } from "zod";

export const EmptyInputSchema = z.object({}).optional();

export const ReadTablesInputSchema = z.object({
  schemaName: z.string().optional(),
});

export const ReadColumnsInputSchema = z.object({
  schemaName: z.string().optional(),
  tableName: z.string().optional(),
});

export const ReadRelationshipsInputSchema = z.object({
  schemaName: z.string().optional(),
  tableName: z.string().optional(),
});

export const ReadIndexesInputSchema = z.object({
  schemaName: z.string().optional(),
  tableName: z.string().optional(),
});

export const ValidateSqlInputSchema = z.object({
  query: z.string().min(1),
});

export const ExplainQueryInputSchema = z.object({
  query: z.string().min(1),
});
