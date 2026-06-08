# Security Rules

- Use read-only database credentials by default.
- Validate SQL before execution.
- Reject multiple statements in read-only tools.
- Block destructive SQL unless an explicit approval workflow is added.
- Treat migration output as a draft, not an execution command.
- Keep secrets out of prompts, logs, and generated documentation.

