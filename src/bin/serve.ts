import { startHttpServer } from "../server";

startHttpServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
