export interface Section {
  id: string;
  title: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  error?: number;
  type: 'Observed' | 'Prediction' | 'Consensus';
  color: string;
}

export interface Metric {
  label: string;
  value: string;
  description: string;
}