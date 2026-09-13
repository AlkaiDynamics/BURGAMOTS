import React from 'react';
import { Archive, FileCheck2, FlaskConical, GitBranch, ShieldAlert, ShieldCheck } from 'lucide-react';
import EvidencePanel from './components/EvidencePanel';
import { createEvidenceViewModel } from './evidence/viewModel.js';
import hypothesisSchema from './contracts/hypothesis.schema.json';
import resultSchema from './contracts/analysis-result.schema.json';
import originalHypothesis from './evidence/hypotheses/original-purpose.json';
import publicHeliophysicsHypothesis from './evidence/hypotheses/public-heliophysics.json';
import originalBlockedResult from './evidence/results/original-purpose-blocked.json';
import publicHeliophysicsBlockedResult from './evidence/results/public-heliophysics-blocked.json';

const originalPurposeView = createEvidenceViewModel({
  hypothesisSchema,
  resultSchema,
  hypothesis: originalHypothesis,
  result: originalBlockedResult,
});

const publicHeliophysicsView = createEvidenceViewModel({
  hypothesisSchema,
  resultSchema,
  hypothesis: publicHeliophysicsHypothesis,
  result: publicHeliophysicsBlockedResult,
});

const architectureSteps = [
  'Hypothesis contract',
  'Dataset manifest',
  'Immutable provenance',
  'Evaluation boundary',
  'Analysis configuration',
  'Scientific executor boundary',
  'Result manifest',
  'Claim-state evaluator',
  'Derived UI view model',
];

const App: React.FC = () => {
  return (
    <main className="min-h-screen bg-deep-space text-gray-200">
      <header className="relative overflow-hidden border-b border-white/10 px-6 py-20 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.12),_transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-solar-gold/30 bg-solar-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-solar-gold">
            <ShieldCheck size={15} /> Evidence-integrity successor
          </div>
          <h1 className="max-w-4xl font-serif text-4xl font-bold leading-tight text-white lg:text-6xl">
            BURGAMOTS
            <span className="mt-2 block text-2xl font-normal text-gray-400 lg:text-3xl">Evidence-bounded research interface</span>
          </h1>
          <p className="mt-7 max-w-3xl text-lg leading-relaxed text-gray-300">
            The historical prototype is preserved, but its validation-style claims are not active scientific results. Scientific execution remains blocked until the unresolved target, data, control, and evaluation decisions are explicitly approved.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-300"><ShieldAlert size={17} /> Scientific state</div>
              <p className="mt-2 text-sm text-gray-400">BLOCKED — no inspectable empirical result is available.</p>
            </div>
            <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-300"><GitBranch size={17} /> Historical leakage</div>
              <p className="mt-2 text-sm text-gray-400">UNRESOLVED — successor controls do not clear the frozen pipeline.</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-200"><Archive size={17} /> Historical prototype</div>
              <p className="mt-2 text-sm text-gray-400">Preserved as audit evidence; not treated as current validation.</p>
            </div>
          </div>
        </div>
      </header>

      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-solar-gold">Current scientific contracts</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-white">Separate questions, separate evidence states</h2>
            <p className="mt-4 leading-relaxed text-gray-400">
              The original BURGAMOTS falsification target and the later public heliophysics proposal are isolated. Evidence attached to one hypothesis cannot promote the status of the other.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-2">
            <EvidencePanel viewModel={originalPurposeView} />
            <EvidencePanel viewModel={publicHeliophysicsView} />
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-cosmic-blue/20 px-6 py-16 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">System boundary</p>
              <h2 className="mt-2 font-serif text-3xl font-bold text-white">Evidence pipeline</h2>
            </div>
            <span className="w-fit rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-200">
              PROPOSED ARCHITECTURE — NOT CURRENTLY IMPLEMENTED
            </span>
          </div>

          <p className="max-w-3xl leading-relaxed text-gray-400">
            The contracts and integrity gates exist now; the real scientific executor, approved empirical dataset, confirmatory analysis, and domain model do not. The interface therefore cannot promote a claim merely because a chart, component, or executor requests a stronger status.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {architectureSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-solar-gold/10 font-mono text-xs text-solar-gold">{index + 1}</span>
                <span className="text-sm text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div className="flex items-center gap-3 text-solar-gold">
              <FlaskConical size={20} />
              <h2 className="font-serif text-2xl font-bold text-white">What is not established</h2>
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-gray-400">
              <li>• No validation, causality, blind-test performance, 5σ significance, or prospective predictive superiority is established.</li>
              <li>• No physical torque measurement or operational DeepXDE/PINN execution is established.</li>
              <li>• No economic or operational utility claim is established.</li>
              <li>• No authoritative empirical dataset or confirmatory analysis has been approved.</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-7">
            <div className="flex items-center gap-3 text-green-300">
              <FileCheck2 size={20} />
              <h2 className="font-serif text-2xl font-bold text-white">What this successor does establish</h2>
            </div>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-gray-400">
              <li>• Hypothesis, result, provenance, evaluation-boundary, and claim-state contracts are machine-checkable.</li>
              <li>• Missing evidence remains null or blocked rather than becoming a fabricated statistic.</li>
              <li>• Original-purpose and heliophysics proposal states remain isolated.</li>
              <li>• The exact frozen solar visualization source is preserved in the protected archive for future product reuse; it has no authority over scientific claim state.</li>
            </ul>
          </article>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-gray-500">
        Frozen audit baseline: <span className="font-mono">8a9029b69b107d4230c9f053b4c8ef545a99e90e</span>. This interface reports evidence state; it does not execute the BURGAMOTS scientific experiment.
      </footer>
    </main>
  );
};

export default App;
