export function normalizeSql(sql: string): string {
  return sql
    .trim()
    .replace(/\s+/g, " ");
}

export function removeSqlComments(sql: string): string {
  return sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();
}

export const normalizeSqlWhitespace = normalizeSql;
