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
  allowedPhrases: string[];
  forbiddenPhrases: string[];
}

export interface EvidenceViewModelInput {
  hypothesisSchema: unknown;
  resultSchema: unknown;
  hypothesis: unknown;
  result: unknown;
  registry?: unknown;
}

export function createEvidenceViewModel(input: EvidenceViewModelInput): EvidenceViewModel;
