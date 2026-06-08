# Architecture

The project is organized around four layers:

1. Entry points: `src/index.ts` and `src/server.ts`.
2. Tool registry: `src/mcp/*` and `src/tools/*`.
3. Domain services: `src/services/*`.
4. Database and safety adapters: `src/database/*` and `src/safety/*`.

The agent layer delegates database inspection to tools and services. It should not directly run arbitrary SQL.

