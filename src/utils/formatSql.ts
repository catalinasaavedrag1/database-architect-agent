export function normalizeSqlWhitespace(sqlText: string) {
  return sqlText
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ');
}

