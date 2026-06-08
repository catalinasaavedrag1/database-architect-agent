import { readSchemaTool } from '../src/tools/readSchema.tool';

async function main() {
  const result = await readSchemaTool();
  console.log(JSON.stringify(result, null, 2));
}

void main();
