import { detectDestructiveQuery } from './destructiveQueryDetector';

export function approvalRequiredForSql(sqlText: string) {
  const detection = detectDestructiveQuery(sqlText);

  return {
    required: detection.destructive,
    reasons: detection.reasons,
  };
}

