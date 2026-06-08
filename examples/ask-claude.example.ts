import { runClaudeDatabaseArchitect } from "../src/claude/databaseArchitectClaude.agent";

async function main() {
  const answer = await runClaudeDatabaseArchitect({
    question: `
Analiza la base de datos.
Detecta tablas sin primary key, relaciones débiles e índices faltantes.
No propongas cambios destructivos.
`,
  });

  console.log(answer);
}

main().catch(console.error);
