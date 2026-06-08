export type JsonObject = Record<string, unknown>;

export interface ToolDefinition<TInput extends JsonObject = JsonObject, TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: JsonObject;
  handler(input: TInput): Promise<TOutput> | TOutput;
}

