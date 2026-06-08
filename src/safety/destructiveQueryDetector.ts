const destructivePatterns = [
  /\bdrop\b/i,
  /\btruncate\b/i,
  /\balter\b/i,
  /\bdelete\b/i,
  /\bupdate\b/i,
  /\binsert\b/i,
  /\bmerge\b/i,
  /\bcreate\b/i,
  /\bgrant\b/i,
  /\brevoke\b/i,
  /\bexecute\b/i,
  /\bexec\b/i,
];

export function detectDestructiveQuery(sqlText: string) {
  const normalized = stripSqlComments(sqlText);
  const reasons = destructivePatterns
    .filter((pattern) => pattern.test(normalized))
    .map((pattern) => `Matched blocked SQL pattern: ${pattern.source}`);

  return {
    destructive: reasons.length > 0,
    reasons,
  };
}

function stripSqlComments(sqlText: string) {
  return sqlText
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

