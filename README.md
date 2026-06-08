# Database Architect Agent

Database Architect Agent is a TypeScript scaffold for a Claude-powered assistant that can inspect SQL Server metadata, explain read-only SQL, suggest indexes, draft migrations, and generate schema documentation.

The project is intentionally read-first. Destructive SQL is detected, mutation-oriented actions require explicit approval, and database clients are expected to run with read-only credentials by default.

## Stack

- TypeScript
- SQL Server metadata reader
- Claude prompt orchestration
- MCP-style tool registry
- SQL safety guards and permission policy

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Configure SQL Server access in `.env`:

```text
DB_HOST=localhost
DB_PORT=1433
DB_NAME=YourDatabaseName
DB_USER=your_user
DB_PASSWORD=your_password
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

## Scripts

- `npm run dev`: run the TypeScript test entrypoint
- `npm run build`: compile TypeScript into `dist/`
- `npm run start`: run compiled output
- `npm run typecheck`: run TypeScript without emitting files
- `npm test`: run Vitest

## Safety Model

The agent is designed to support:

- schema reads
- metadata analysis
- read-only query validation
- SQL Server estimated execution plans
- index suggestions
- migration drafts
- generated documentation

It should not run `DROP`, `TRUNCATE`, `ALTER`, `UPDATE`, `DELETE`, `INSERT`, `MERGE`, `GRANT`, `REVOKE`, or procedural execution without explicit approval and a separate execution path.
