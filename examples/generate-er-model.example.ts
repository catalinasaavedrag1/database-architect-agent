import { readRelationshipsTool } from '../src/tools/readRelationships.tool';

async function main() {
  const relationships = await readRelationshipsTool.handler({ schema: 'public' });
  console.log(JSON.stringify(relationships, null, 2));
}

void main();

