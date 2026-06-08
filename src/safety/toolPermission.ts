import { permissionPolicy } from "./permissionPolicy";

export interface ToolPermissionDecision {
  allowed: boolean;
  requiresApproval: boolean;
  reason?: string;
}

/**
 * Defense-in-depth gate for the MCP runtime: only tools on the read-only
 * allowlist run unconditionally. Anything else (e.g. a migration generator, or
 * any mutating tool added later) is blocked unless the caller passes an explicit
 * approval flag. This keeps the runtime safe-by-default even if a non-read-only
 * tool is registered in the future.
 */
export function evaluateToolPermission(
  toolName: string,
  approved = false
): ToolPermissionDecision {
  if (permissionPolicy.readOnlyTools.includes(toolName)) {
    return { allowed: true, requiresApproval: false };
  }

  if (approved) {
    return { allowed: true, requiresApproval: true };
  }

  const known = permissionPolicy.approvalRequiredTools.includes(toolName);

  return {
    allowed: false,
    requiresApproval: true,
    reason: known
      ? `Tool '${toolName}' requires explicit human approval`
      : `Tool '${toolName}' is not in the read-only allowlist and requires explicit human approval`,
  };
}
