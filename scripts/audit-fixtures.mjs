import { readFileSync } from 'node:fs';
const app = readFileSync('App.tsx','utf8');
const forbiddenImports = ['ValidationCharts','FlareCorrelationChart','SolarCycleChart','FullPaper'];
const failures = forbiddenImports.filter((name) => app.includes(name));
if (failures.length) {
  console.error(`Active runtime still imports historical validation/fixture presentation: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('audit:fixtures PASS — historical validation/fixture components are not in the active App import graph.');