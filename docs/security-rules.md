# Security Rules

## Default Mode

The agent operates in **read-only mode by default**. It uses read-only database
credentials and never executes structural or destructive SQL without an explicit
human-approval workflow.

## Operating Principles

- Use read-only database credentials by default.
- Validate SQL before execution.
- Reject multiple statements in read-only tools.
- Block destructive SQL unless an explicit approval workflow is added.
- Treat migration output as a draft, not an execution command.
- Keep secrets out of prompts, logs, and generated documentation.

## Allowed (read-only)

- Read schema
- Read tables
- Read columns
- Read relationships
- Read indexes
- Validate SQL
- Explain read-only queries
- Generate documentation

## Blocked Without Approval

The following keywords are treated as destructive and blocked by the SQL guard
(`src/safety/sqlGuard.ts`, `src/safety/destructiveQueryDetector.ts`):

- DROP
- DELETE
- TRUNCATE
- ALTER
- UPDATE
- INSERT
- MERGE
- EXEC / EXECUTE
- CREATE
- GRANT
- REVOKE
- DENY

## Human Approval Required

Any SQL that modifies data or structure requires explicit human approval before
it can run through a separate execution path.

## Production Rule

The agent must never execute structural or destructive SQL directly in
production.
