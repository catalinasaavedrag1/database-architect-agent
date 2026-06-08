export type SqlRiskLevel = "SAFE" | "WARNING" | "DANGEROUS";

export interface SqlGuardResult {
  isAllowed: boolean;
  riskLevel: SqlRiskLevel;
  reasons: string[];
  requiresHumanApproval: boolean;
}

const dangerousPatterns: RegExp[] = [
  /\bDROP\b/i,
  /\bDELETE\b/i,
  /\bTRUNCATE\b/i,
  /\bALTER\b/i,
  /\bUPDATE\b/i,
  /\bINSERT\b/i,
  /\bMERGE\b/i,
  /\bCREATE\b/i,
  /\bEXEC\b/i,
  /\bEXECUTE\b/i,
  /\bGRANT\b/i,
  /\bREVOKE\b/i,
  /\bDENY\b/i,
];

const suspiciousPatterns: RegExp[] = [
  /--/i,
  /\/\*/i,
  /\*\//i,
  /;/i,
  /\bxp_/i,
  /\bsp_configure\b/i,
  /\bOPENROWSET\b/i,
  /\bOPENDATASOURCE\b/i,
];

export function validateReadOnlySql(query: string): SqlGuardResult {
  const normalizedQuery = query.trim();
  const reasons: string[] = [];

  if (!normalizedQuery) {
    return {
      isAllowed: false,
      riskLevel: "DANGEROUS",
      reasons: ["Query is empty"],
      requiresHumanApproval: true,
    };
  }

  if (!/^SELECT\b/i.test(normalizedQuery) && !/^WITH\b/i.test(normalizedQuery)) {
    reasons.push("Only SELECT or WITH queries are allowed");
  }

  for (const pattern of dangerousPatterns) {
    if (pattern.test(normalizedQuery)) {
      reasons.push(`Dangerous SQL keyword detected: ${pattern.source}`);
    }
  }

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(normalizedQuery)) {
      reasons.push(`Suspicious SQL pattern detected: ${pattern.source}`);
    }
  }

  if (reasons.length > 0) {
    return {
      isAllowed: false,
      riskLevel: "DANGEROUS",
      reasons,
      requiresHumanApproval: true,
    };
  }

  return {
    isAllowed: true,
    riskLevel: "SAFE",
    reasons: ["Query is read-only"],
    requiresHumanApproval: false,
  };
}

export function assertReadOnlySql(query: string): void {
  const result = validateReadOnlySql(query);

  if (!result.isAllowed) {
    throw new Error(
      `SQL query blocked by SqlGuard: ${result.reasons.join(", ")}`
    );
  }
}
