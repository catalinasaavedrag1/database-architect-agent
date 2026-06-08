import { suggestIndexesTool } from '../src/tools/suggestIndexes.tool';
import { validateSqlTool } from '../src/tools/validateSql.tool';

async function main() {
  const sql = 'select * from orders o join customers c on c.id = o.customer_id where o.status = $1';
  console.log(await validateSqlTool.handler({ sql }));
  console.log(await suggestIndexesTool.handler({ sql, schema: 'public' }));
}

void main();

