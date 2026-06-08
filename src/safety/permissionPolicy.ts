export const permissionPolicy = {
  readOnlyTools: [
    'read_schema',
    'read_tables',
    'read_columns',
    'read_relationships',
    'read_indexes',
    'validate_sql',
    'explain_query',
    'suggest_indexes',
    'document_schema',
  ],
  approvalRequiredTools: ['generate_migration'],
  blockedWithoutApproval: ['ddl', 'dml', 'role_change', 'permission_change', 'procedural_execution'],
};

