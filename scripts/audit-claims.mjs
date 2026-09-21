import { readFileSync } from 'node:fs';

const active = ['App.tsx', 'components/EvidencePanel.tsx', 'README.md', 'metadata.json'];

const forbiddenPatterns = [
  { name: 'numeric significance threshold', re: /\bp\s*[<>=≤≥]\s*0?\.\d+/i },
  { name: 'numeric correlation claim', re: /\br\s*=\s*[-+]?0?\.\d+/i },
  { name: 'sigma-style significance claim', re: /\b\d+(?:\.\d+)?\s*σ\b/i },
  { name: 'numeric accuracy/confidence/RMSE/blind claim', re: /(?:accuracy|confidence|rmse|blind)[^\n]{0,80}\b\d+(?:\.\d+)?\s*%|\b\d+(?:\.\d+)?\s*%[^\n]{0,80}(?:accuracy|confidence|rmse|blind)/i },
  { name: 'physical-sounding synthetic index label', re: /torque\s+index/i },
  { name: 'operational model-status language', re: /predictive\s+mode\s+active|high[- ]fidelity\s+training/i },
];

const failures = [];
for (const file of active) {
  const text = readFileSync(file, 'utf8');
  for (const { name, re } of forbiddenPatterns) {
    if (re.test(text)) failures.push(`${file}: unsupported active claim form: ${name}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('audit:claims PASS — active presentation and current documentation contain no unsupported numeric scientific-claim forms.');
