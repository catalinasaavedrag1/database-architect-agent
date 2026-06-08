export type JsonObject = Record<string, unknown>;

export interface ToolDefinition<Input = unknown, Output = unknown> {
  name: string;
  description: string;
  inputSchema?: JsonObject;
  execute: (input: Input) => Promise<Output> | Output;
  handler?: (input: Input) => Promise<Output> | Output;
}

export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
