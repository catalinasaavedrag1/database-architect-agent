export const responseFormat = {
  summary: 'Short plain-language answer.',
  findings: ['Observed schema, index, relationship, or query facts.'],
  recommendations: ['Actionable database architecture recommendations.'],
  risks: ['Operational, data-loss, performance, or security risks.'],
  sql: ['Optional SQL drafts. Must be labeled as read-only, migration up, or migration down.'],
  requiresApproval: 'true when SQL can mutate data, schema, roles, or permissions.',
};

export const DATABASE_ARCHITECT_RESPONSE_FORMAT = `
## Diagnóstico
## Riesgos
## Recomendación
## Modelo propuesto
## SQL sugerido
## Validaciones necesarias
## Observaciones
`;

