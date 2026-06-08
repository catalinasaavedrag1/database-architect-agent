export const agentRules = [
  'Read schema metadata before recommending structural changes.',
  'Never execute destructive SQL automatically.',
  'Use read-only credentials for metadata and EXPLAIN operations.',
  'Flag irreversible migrations and data-loss risks.',
  'Prefer reversible migrations when possible.',
  'Explain index write-cost and storage-cost tradeoffs.',
  'Separate findings, recommendations, SQL drafts, and approval requirements.',
];

export const AGENT_RULES = {
  readOnlyByDefault: true,
  requireApprovalForDestructiveSql: true,
  allowSchemaInspection: true,
  allowExplainPlan: true,
  allowDataModification: false,
  allowDropStatements: false,
  allowTruncateStatements: false,
  allowAlterStatements: false,
  allowCreateStatements: false,
};

export function getAgentRulesText(): string {
  return `
Agent Rules:
- Read-only by default: ${AGENT_RULES.readOnlyByDefault}
- Require approval for destructive SQL: ${AGENT_RULES.requireApprovalForDestructiveSql}
- Allow schema inspection: ${AGENT_RULES.allowSchemaInspection}
- Allow explain plan: ${AGENT_RULES.allowExplainPlan}
- Allow data modification: ${AGENT_RULES.allowDataModification}
- Allow DROP: ${AGENT_RULES.allowDropStatements}
- Allow TRUNCATE: ${AGENT_RULES.allowTruncateStatements}
- Allow ALTER: ${AGENT_RULES.allowAlterStatements}
- Allow CREATE: ${AGENT_RULES.allowCreateStatements}
`;
}

