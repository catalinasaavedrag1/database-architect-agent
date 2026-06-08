import readline from "readline";
import { runClaudeDatabaseArchitect } from "../claude/databaseArchitectClaude.agent";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log("Database Architect Agent");
  console.log("Escribe 'exit' para salir.");
  console.log("");

  while (true) {
    const question = await ask("> ");

    if (question.toLowerCase() === "exit") {
      break;
    }

    const answer = await runClaudeDatabaseArchitect({
      question,
    });

    console.log("");
    console.log(answer);
    console.log("");
  }

  rl.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
