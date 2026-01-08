import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { ChartDataPoint } from '../types';

const data: ChartDataPoint[] = [
  { name: 'Upton & Hathaway', value: 70, type: 'Consensus', color: '#ef4444' },
  { name: 'NOAA (2019)', value: 115, error: 10, type: 'Consensus', color: '#64748b' },
  { name: 'Scafetta (2023)', value: 153, type: 'Prediction', color: '#3b82f6' },
  { name: 'BURGAMOTS', value: 160.2, error: 12, type: 'Prediction', color: '#d4af37' },
  { name: 'Observed (2024)', value: 162, type: 'Observed', color: '#22c55e' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-deep-space border border-solar-gold/30 p-3 rounded shadow-xl backdrop-blur-md">
        <p className="text-solar-gold font-bold mb-1">{label}</p>
        <p className="text-white text-sm">SSN: {item.value}</p>
        {item.error && <p className="text-gray-400 text-xs">Range: ±{item.error}</p>}
        <p className="text-gray-400 text-xs capitalize mt-1">Type: {item.type}</p>
      </div>
    );
  }
  return null;
};

const SolarCycleChart: React.FC = () => {
  return (
    <div className="w-full h-[450px] bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6 backdrop-blur-sm flex flex-col">
      <div className="flex justify-between items-end mb-6 shrink-0">
        <div>
            <h3 className="text-lg font-serif font-bold text-white">Solar Cycle 25 Forecast Comparison</h3>
            <p className="text-xs text-gray-400">Peak Sunspot Number (SSN) Predictions vs Observation</p>
        </div>
        <div className="hidden sm:flex gap-4 text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-sm"></div>Observed</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-solar-gold rounded-sm"></div>BURGAMOTS</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-slate-500 rounded-sm"></div>Others</div>
        </div>
      </div>
      
      {/* Explicit height container to resolve Recharts sizing errors */}
      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 10 }} 
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
              label={{ value: 'Sunspot Number', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <ReferenceLine y={160} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Observed Range', fill: '#22c55e', fontSize: 10, position: 'right' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SolarCycleChart;