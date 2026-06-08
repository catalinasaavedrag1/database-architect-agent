import { detectDestructiveQuery } from './destructiveQueryDetector';

export function validateReadOnlySql(sqlText: string) {
  const trimmed = sqlText.trim();
  const destructive = detectDestructiveQuery(trimmed);
  const startsReadOnly = /^(select|with|explain)\b/i.test(trimmed);
  const hasMultipleStatements = trimmed.split(';').filter((part) => part.trim().length > 0).length > 1;

  if (!trimmed) {
    return {
      allowed: false,
      reasons: ['SQL text is empty.'],
      requiresApproval: false,
    };
  }

  if (!startsReadOnly) {
    return {
      allowed: false,
      reasons: ['Only SELECT, WITH, and EXPLAIN statements are allowed for read-only execution.'],
      requiresApproval: destructive.destructive,
    };
  }

  if (hasMultipleStatements) {
    return {
      allowed: false,
      reasons: ['Multiple SQL statements are not allowed in read-only tool execution.'],
      requiresApproval: destructive.destructive,
    };
  }

  if (destructive.destructive) {
    return {
      allowed: false,
      reasons: destructive.reasons,
      requiresApproval: true,
    };
  }

  return {
    allowed: true,
    reasons: [],
    requiresApproval: false,
  };
}

