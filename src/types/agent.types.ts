export interface AgentMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AgentRequest {
  task: string;
  schema?: string;
  sql?: string;
  context?: Record<string, unknown>;
}

export interface AgentResponse {
  content?: string;
  usedTools?: string[];
  warnings?: string[];
  summary?: string;
  findings?: string[];
  recommendations?: string[];
  risks?: string[];
  sql?: string[];
  requiresApproval?: boolean;
}
