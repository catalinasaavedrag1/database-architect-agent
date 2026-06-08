export interface AgentRequest {
  task: string;
  schema?: string;
  sql?: string;
  context?: Record<string, unknown>;
}

export interface AgentResponse {
  summary: string;
  findings?: string[];
  recommendations: string[];
  risks: string[];
  sql: string[];
  requiresApproval: boolean;
}

