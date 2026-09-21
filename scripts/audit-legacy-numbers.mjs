import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const excludedDirs = new Set(['.git', 'node_modules', 'audit', 'dist']);
const excludedFiles = new Set(['package-lock.json', 'scripts/audit-legacy-numbers.mjs']);
const textExt = /\.(?:md|json|js|mjs|ts|tsx|html|yml|yaml|txt)$/i;

const forbiddenPhrases = [
  'Torque Index',
  'Granger Causality',
  'DeepXDE predictive mode active',
  'High-Fidelity Training',
  'V-E-J Torque Peak',
  'Carrington Event (Hindcast)',
  'Dust Bowl Hindcast',
];

const forbiddenPatterns = [
  { name: 'numeric accuracy/blind/RMSE claim', re: /(?:accuracy|blind|rmse|error)[^\n]{0,80}\b\d+(?:\.\d+)?\s*%|\b\d+(?:\.\d+)?\s*%[^\n]{0,80}(?:accuracy|blind|rmse|error)/i },
  { name: 'sigma significance claim', re: /\b\d+(?:\.\d+)?\s*σ\b/i },
  { name: 'numeric p-value threshold', re: /\bp\s*[<>=≤≥]\s*0?\.\d+/i },
  { name: 'numeric correlation claim', re: /\br\s*=\s*[-+]?0?\.\d+/i },
  { name: 'decimal-year cycle constant', re: /\b\d{1,2}\.\d+\s*[- ]?year/i },
  { name: 'numeric plus-minus result interval', re: /\b\d+(?:\.\d+)?\s*±\s*\d/i },
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (excludedDirs.has(name)) continue;
    const full = join(dir, name);
    const rel = relative(root, full).replaceAll('\\', '/');
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (textExt.test(name) && !excludedFiles.has(rel)) out.push(rel);
  }
  return out;
}

const failures = [];
for (const file of walk(root)) {
  const text = readFileSync(join(root, file), 'utf8');
  for (const phrase of forbiddenPhrases) {
    if (text.includes(phrase)) failures.push(`${file}: legacy demo term remains: ${phrase}`);
  }
  for (const { name, re } of forbiddenPatterns) {
    if (re.test(text)) failures.push(`${file}: ${name}`);
  }
}

if (failures.length) {
  console.error('Legacy-number purge audit FAILED:');
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('audit:legacy-numbers PASS — legacy demo numbers/claim forms are absent outside the immutable audit record.');
