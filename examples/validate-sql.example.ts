import { validateSqlTool } from "../src/tools/validateSql.tool";

const safeQuery = `
SELECT TOP 10 *
FROM dbo.Products
`;

const dangerousQuery = `
DELETE FROM dbo.Products
`;

console.log(validateSqlTool({ query: safeQuery }));
console.log(validateSqlTool({ query: dangerousQuery }));
