import { readSchemaTool } from '../src/tools/readSchema.tool';

async function main() {
  const result = await readSchemaTool.handler({ schema: 'public' });
  console.log(JSON.stringify(result, null, 2));
}

void main();

