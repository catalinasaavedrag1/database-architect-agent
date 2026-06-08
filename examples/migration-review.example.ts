import { generateMigrationTool } from '../src/tools/generateMigration.tool';

async function main() {
  const migration = await generateMigrationTool.execute({
    engine: 'postgres',
    changeRequest: 'Add a nullable archived_at column to invoices.',
  });

  console.log(migration);
}

void main();
