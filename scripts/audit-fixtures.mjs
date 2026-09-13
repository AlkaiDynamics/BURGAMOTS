import { readFileSync } from 'node:fs';

const app = readFileSync('App.tsx', 'utf8');
const forbiddenImports = [
  'ValidationCharts',
  'FlareCorrelationChart',
  'SolarCycleChart',
  'FullPaper',
  'SolarSystemViz',
  'PINNDiagram',
  'SystemArchDiagram',
  'PipelineDiagram',
];
const failures = forbiddenImports.filter((name) => app.includes(name));
if (failures.length) {
  console.error(`Active runtime still imports historical/illustrative presentation as current evidence: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('audit:fixtures PASS — historical and illustrative components are outside the active scientific claim path.');
