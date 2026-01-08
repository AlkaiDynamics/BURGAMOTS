import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Label } from 'recharts';

// Mock data representing historical flares correlated with calculated torque at that time
const data = [
  { torque: 0.15, intensity: 1.2, class: 'C', date: '2021-03-12' },
  { torque: 0.22, intensity: 1.8, class: 'C', date: '2021-04-05' },
  { torque: 0.35, intensity: 2.5, class: 'C', date: '2021-06-18' },
  { torque: 0.45, intensity: 4.1, class: 'M', date: '2022-01-20' },
  { torque: 0.48, intensity: 3.8, class: 'M', date: '2022-02-14' },
  { torque: 0.55, intensity: 5.2, class: 'M', date: '2022-04-30' },
  { torque: 0.62, intensity: 4.9, class: 'M', date: '2022-08-11' },
  { torque: 0.68, intensity: 6.5, class: 'M', date: '2022-10-02' },
  { torque: 0.72, intensity: 8.1, class: 'X', date: '2023-01-09' },
  { torque: 0.78, intensity: 7.5, class: 'M', date: '2023-03-15' },
  { torque: 0.82, intensity: 12.5, class: 'X', date: '2023-07-22' },
  { torque: 0.85, intensity: 9.8, class: 'X', date: '2023-09-01' },
  { torque: 0.88, intensity: 15.2, class: 'X', date: '2023-11-28' },
  { torque: 0.91, intensity: 22.0, class: 'X', date: '2024-02-10' },
  { torque: 0.94, intensity: 18.5, class: 'X', date: '2024-05-14' },
  { torque: 0.96, intensity: 25.1, class: 'X', date: '2024-08-08' },
  { torque: 0.25, intensity: 2.1, class: 'C', date: '2021-08-22' },
  { torque: 0.30, intensity: 3.5, class: 'C', date: '2021-11-05' },
  { torque: 0.52, intensity: 5.8, class: 'M', date: '2022-06-12' },
  { torque: 0.60, intensity: 2.9, class: 'C', date: '2022-09-19' }, // Outlier
];

const getClassColor = (cls: string) => {
    switch(cls) {
        case 'X': return '#ef4444'; // Red
        case 'M': return '#d4af37'; // Gold
        default: return '#3b82f6';  // Blue
    }
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-deep-space border border-solar-gold/30 p-3 rounded shadow-xl backdrop-blur-md text-xs">
        <p className="text-solar-gold font-bold mb-1">{item.date}</p>
        <p className="text-white">Class: <span style={{color: getClassColor(item.class)}}>{item.class}-Class</span></p>
        <p className="text-gray-300">Intensity: {item.intensity} µW/m²</p>
        <p className="text-gray-400">Torque Index (η): {item.torque}</p>
      </div>
    );
  }
  return null;
};

const FlareCorrelationChart: React.FC = () => {
  return (
    <div className="w-full h-[400px] bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6 backdrop-blur-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
            <h3 className="text-lg font-serif font-bold text-white">Barycentric Forcing vs. Flare Intensity</h3>
            <p className="text-xs text-gray-400">Correlation of Torque Index (η) with GOES X-Ray Flux</p>
        </div>
        <div className="flex gap-3 text-[10px] uppercase font-bold tracking-wider">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>C-Class</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-solar-gold"></div>M-Class</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>X-Class</div>
        </div>
      </div>
      
      <div className="w-full h-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis 
              type="number" 
              dataKey="torque" 
              name="Torque Index" 
              domain={[0, 1]} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
            >
                <Label value="Barycentric Torque Index (η)" offset={0} position="insideBottom" fill="#64748b" fontSize={12} />
            </XAxis>
            <YAxis 
              type="number" 
              dataKey="intensity" 
              name="Intensity" 
              domain={[0, 30]} 
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
            >
                <Label value="Flare Intensity (Arbitrary Flux Units)" angle={-90} position="insideLeft" fill="#64748b" fontSize={12} />
            </YAxis>
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#ffffff30' }} />
            
            {/* Trend Line (Visual Approximation) */}
            <ReferenceLine 
                segment={[{ x: 0.1, y: 1 }, { x: 0.95, y: 24 }]} 
                stroke="#d4af37" 
                strokeDasharray="5 5" 
                strokeOpacity={0.5} 
            />

            <Scatter name="Flares" data={data} fill="#8884d8">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getClassColor(entry.class)} stroke="rgba(255,255,255,0.2)" />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FlareCorrelationChart;