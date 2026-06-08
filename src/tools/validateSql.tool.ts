import {
  validateReadOnlySql,
  SqlGuardResult,
} from "../safety/sqlGuard";

export interface ValidateSqlInput {
  query: string;
}

export interface ValidateSqlOutput extends SqlGuardResult {
  query: string;
}

export function validateSqlTool(input: ValidateSqlInput): ValidateSqlOutput {
  const result = validateReadOnlySql(input.query);

  return {
    query: input.query,
    ...result,
  };
}
