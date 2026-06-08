import fs from "fs";
import path from "path";
import { documentSchemaTool } from "../src/tools/documentSchema.tool";

async function main() {
  const markdown = await documentSchemaTool();
  const outputPath = path.join(__dirname, "../docs/generated-schema.md");

  fs.writeFileSync(outputPath, markdown, "utf-8");
  console.log(`Schema documentation generated at: ${outputPath}`);
}

main().catch(console.error);
