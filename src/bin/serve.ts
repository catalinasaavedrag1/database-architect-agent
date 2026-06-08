import { validateEnv } from "../config/validateEnv";
import { startHttpServer } from "../server";

try {
  validateEnv();
} catch (error) {
  console.error("Invalid environment configuration:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

startHttpServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
