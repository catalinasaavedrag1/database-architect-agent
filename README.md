# Database Architect Agent

Database Architect Agent is a TypeScript scaffold for a Claude-powered assistant that can inspect database metadata, explain read-only SQL, suggest indexes, draft migrations, and generate schema documentation.

The project is intentionally read-first. Destructive SQL is detected, mutation-oriented actions require explicit approval, and database clients are expected to run with read-only credentials by default.

## Stack

- TypeScript
- Express HTTP entrypoint
- Claude client configuration
- MCP-style tool registry
- PostgreSQL and SQL Server client adapters
- SQL safety guards and permission policy

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Then open:

```text
http://localhost:3000/health
```

## Scripts

- `npm run dev`: start the TypeScript server with `tsx`
- `npm run build`: compile TypeScript into `dist/`
- `npm run start`: run compiled output
- `npm run typecheck`: run TypeScript without emitting files
- `npm test`: run Vitest

## Safety Model

The agent is designed to support:

- schema reads
- metadata analysis
- read-only query validation
- `EXPLAIN` plans
- index suggestions
- migration drafts
- generated documentation

It should not run `DROP`, `TRUNCATE`, `ALTER`, `UPDATE`, `DELETE`, `INSERT`, `MERGE`, `GRANT`, `REVOKE`, or procedural execution without explicit approval and a separate execution path.

