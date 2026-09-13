import { readFileSync } from 'node:fs';

const activeClientFiles = [
  'App.tsx',
  'index.tsx',
  'components/EvidencePanel.tsx',
  'evidence/viewModel.js',
  'evidence/resultLoader.js',
  'evidence/claimPolicy.js',
  'evidence/validator.js',
];

const forbiddenPatterns = [
  { label: 'process.env', re: /\bprocess\.env\b/ },
  { label: 'import.meta.env', re: /\bimport\.meta\.env\b/ },
  { label: 'VITE_ environment reference', re: /\bVITE_[A-Z0-9_]+\b/ },
];

const failures = [];
for (const file of activeClientFiles) {
  const text = readFileSync(file, 'utf8');
  for (const pattern of forbiddenPatterns) {
    if (pattern.re.test(text)) failures.push(`${file}: active client contains ${pattern.label}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('audit:env PASS — active client code contains no environment-variable access or client-exposed VITE_ references.');
