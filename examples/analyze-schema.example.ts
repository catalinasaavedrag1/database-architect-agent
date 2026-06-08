import { readSchemaTool } from "../src/tools/readSchema.tool";
import { analyzeSchema } from "../src/services/schemaAnalyzer.service";
import { analyzeRelationships } from "../src/services/relationshipAnalyzer.service";
import { analyzeIndexes } from "../src/services/indexAnalyzer.service";

async function main() {
  const schema = await readSchemaTool();

  const schemaAnalysis = analyzeSchema(schema);
  const relationshipAnalysis = analyzeRelationships(schema);
  const indexAnalysis = analyzeIndexes(schema);

  console.log("Schema Analysis:");
  console.log(JSON.stringify(schemaAnalysis, null, 2));
  console.log("Relationship Analysis:");
  console.log(JSON.stringify(relationshipAnalysis, null, 2));
  console.log("Index Analysis:");
  console.log(JSON.stringify(indexAnalysis, null, 2));
}

main().catch(console.error);
