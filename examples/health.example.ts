import { getHealthStatus } from "../src/health/health.service";

async function main() {
  const health = await getHealthStatus();
  console.log(JSON.stringify(health, null, 2));
}

main().catch(console.error);
