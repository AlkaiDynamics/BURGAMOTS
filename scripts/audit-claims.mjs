import { readFileSync } from 'node:fs';

const active = ['App.tsx', 'components/EvidencePanel.tsx', 'README.md', 'metadata.json'];
const forbidden = [
  '99.8%',
  '94.2%',
  '5σ',
  'Granger Causality Test',
  'DeepXDE predictive mode active',
  'High-Fidelity Training',
  'Torque Index (η)',
  'validated by its ability',
  'reduce prediction uncertainty by an order of magnitude',
  'r = 0.89',
  '$2T',
];
const failures = [];
for (const file of active) {
  const text = readFileSync(file, 'utf8');
  for (const phrase of forbidden) {
    if (text.includes(phrase)) failures.push(`${file}: unsupported active phrase: ${phrase}`);
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('audit:claims PASS — unsupported historical validation language is absent from active presentation and current documentation.');
