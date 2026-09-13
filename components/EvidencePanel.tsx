import React from 'react';
import { AlertTriangle, Database, FileSearch, ShieldCheck } from 'lucide-react';

export interface EvidenceViewModel {
  id: string;
  hypothesisId: string;
  title: string;
  state: string;
  statusLabel: string;
  summary: string;
  source: string;
  method: string | null;
  provenanceSummary: string;
  limitations: string[];
  unresolvedFields: string[];
  estimate: number | null;
  uncertainty: unknown | null;
  pValue: number | null;
  sample: { n: number | null; independentN: number | null };
}

interface EvidencePanelProps {
  viewModel: EvidenceViewModel;
}

const EvidencePanel: React.FC<EvidencePanelProps> = ({ viewModel }) => {
  const hasStatistic = viewModel.estimate !== null || viewModel.pValue !== null;

  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 lg:p-8 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Hypothesis contract</p>
          <h3 className="mt-2 font-serif text-2xl font-bold text-white">{viewModel.title}</h3>
        </div>
        <span className="w-fit rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold tracking-wide text-amber-300">
          {viewModel.statusLabel}
        </span>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-gray-300">{viewModel.summary}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-200">
            <FileSearch size={16} className="text-solar-gold" /> Evidence source
          </div>
          <p className="text-xs leading-relaxed text-gray-400">{viewModel.source}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-200">
            <Database size={16} className="text-blue-300" /> Provenance
          </div>
          <p className="text-xs leading-relaxed text-gray-400">{viewModel.provenanceSummary}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-200">
          <ShieldCheck size={16} className="text-green-300" /> Scientific output
        </div>
        {hasStatistic ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            {viewModel.estimate !== null && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-gray-500">Estimate</dt>
                <dd className="font-mono text-white">{viewModel.estimate}</dd>
              </div>
            )}
            {viewModel.pValue !== null && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-gray-500">p-value</dt>
                <dd className="font-mono text-white">{viewModel.pValue}</dd>
              </div>
            )}
            {viewModel.method !== null && (
              <div>
                <dt className="text-xs uppercase tracking-wider text-gray-500">Method</dt>
                <dd className="text-white">{viewModel.method}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-gray-400">No empirical statistic is available. Missing values remain null; they are not converted to zero.</p>
        )}
      </div>

      {viewModel.unresolvedFields.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-amber-300">
            <AlertTriangle size={16} /> Unresolved scientific fields
          </div>
          <div className="flex flex-wrap gap-2">
            {viewModel.unresolvedFields.map((field) => (
              <span key={field} className="rounded-md border border-amber-400/20 bg-amber-400/5 px-2 py-1 font-mono text-[11px] text-amber-200/80">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {viewModel.limitations.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Limitations</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-400">
            {viewModel.limitations.map((limitation) => <li key={limitation}>• {limitation}</li>)}
          </ul>
        </div>
      )}
    </article>
  );
};

export default EvidencePanel;
