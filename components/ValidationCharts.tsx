import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area, Legend, ComposedChart } from 'recharts';

// --- Colors ---
const GOLD = '#d4af37';
const RED = '#ef4444';
const BLUE = '#3b82f6';
const GREEN = '#22c55e';
const TEXT_MUTED = '#94a3b8';

// --- 1. Carrington Event Hindcast ---
const carringtonData = [
  { year: 1855, observed: 15, predicted: 18 },
  { year: 1856, observed: 25, predicted: 28 },
  { year: 1857, observed: 35, predicted: 38 },
  { year: 1858, observed: 45, predicted: 52 },
  { year: 1859, observed: 180, predicted: 165, annotation: "Event" }, // Peak
  { year: 1860, observed: 90, predicted: 85 },
  { year: 1861, observed: 40, predicted: 38 },
  { year: 1862, observed: 25, predicted: 22 },
];

export const CarringtonChart = () => (
  <div className="h-[300px] w-full bg-black/20 rounded-lg p-2 border border-white/5">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={carringtonData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="year" stroke={TEXT_MUTED} fontSize={12} tickLine={false} />
        <YAxis stroke={TEXT_MUTED} fontSize={12} tickLine={false} label={{ value: 'Sunspot Number', angle: -90, position: 'insideLeft', fill: TEXT_MUTED, fontSize: 10 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f1419', borderColor: '#334155', color: '#f8fafc' }}
          itemStyle={{ fontSize: 12 }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" />
        <ReferenceLine x={1859} stroke={GOLD} label={{ value: 'Carrington Event', fill: GOLD, fontSize: 10, position: 'insideTopRight' }} />
        <Line type="monotone" dataKey="observed" name="Observed (Proxy)" stroke={GOLD} strokeWidth={2} dot={{ r: 4 }} />
        <Line type="monotone" dataKey="predicted" name="BURGAMOTS Hindcast" stroke={RED} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// --- 2. Dust Bowl Hindcast ---
const dustBowlData = [
  { year: 1928, anomaly: -12, predicted: -10 },
  { year: 1929, anomaly: -22, predicted: -25 },
  { year: 1930, anomaly: -28, predicted: -30 },
  { year: 1931, anomaly: -18, predicted: -20 },
  { year: 1932, anomaly: -8, predicted: -10 },
  { year: 1933, anomaly: -12, predicted: -15 },
  { year: 1934, anomaly: -25, predicted: -22 },
  { year: 1935, anomaly: -15, predicted: -18 },
  { year: 1936, anomaly: -2, predicted: -5 },
  { year: 1937, anomaly: 8, predicted: 5 },
];

export const DustBowlChart = () => (
  <div className="h-[300px] w-full bg-black/20 rounded-lg p-2 border border-white/5">
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={dustBowlData}>
        <defs>
          <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BLUE} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={BLUE} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="year" stroke={TEXT_MUTED} fontSize={12} tickLine={false} />
        <YAxis stroke={TEXT_MUTED} fontSize={12} tickLine={false} label={{ value: 'Precip. Anomaly (%)', angle: -90, position: 'insideLeft', fill: TEXT_MUTED, fontSize: 10 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#0f1419', borderColor: '#334155', color: '#f8fafc' }}
          itemStyle={{ fontSize: 12 }}
        />
        <Legend verticalAlign="top" height={36} iconType="circle" />
        <ReferenceLine y={0} stroke="#64748b" />
        <Area type="monotone" dataKey="anomaly" name="Observed Anomaly" fillOpacity={1} fill="url(#colorAnomaly)" stroke={BLUE} />
        <Line type="monotone" dataKey="predicted" name="Model Prediction" stroke="#fdba74" strokeWidth={2} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  </div>
);

// --- 3. Accuracy / RMSE Comparison ---
const accuracyData = [
  { name: 'Stochastic', solar: 22.0, atmos: 25.0 },
  { name: 'CMIP6 GCM', solar: 18.0, atmos: 15.0 },
  { name: 'Ensemble', solar: 20.0, atmos: 18.0 },
  { name: 'BURGAMOTS', solar: 8.5, atmos: 7.2 },
];

export const AccuracyChart = () => (
  <div className="h-[250px] w-full bg-black/20 rounded-lg p-2 border border-white/5">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={accuracyData} barGap={0}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
        <XAxis dataKey="name" stroke={TEXT_MUTED} fontSize={10} tickLine={false} />
        <YAxis stroke={TEXT_MUTED} fontSize={10} tickLine={false} label={{ value: 'RMSE (%)', angle: -90, position: 'insideLeft', fill: TEXT_MUTED, fontSize: 10 }} />
        <Tooltip 
          cursor={{fill: 'transparent'}}
          contentStyle={{ backgroundColor: '#0f1419', borderColor: '#334155', color: '#f8fafc' }}
        />
        <Legend iconType="circle" fontSize={10} />
        <Bar dataKey="solar" name="Solar Activity" fill={GOLD} radius={[4, 4, 0, 0]} />
        <Bar dataKey="atmos" name="Atmospheric" fill={BLUE} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// --- 4. Prediction Skill Drop-off ---
const skillData = [
  { month: 1, traditional: 0.85, burgamots: 0.92 },
  { month: 6, traditional: 0.75, burgamots: 0.89 },
  { month: 12, traditional: 0.60, burgamots: 0.85 },
  { month: 24, traditional: 0.40, burgamots: 0.78 },
  { month: 60, traditional: 0.15, burgamots: 0.65 }, // 5 Years
];

export const SkillChart = () => (
  <div className="h-[250px] w-full bg-black/20 rounded-lg p-2 border border-white/5">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={skillData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="month" stroke={TEXT_MUTED} fontSize={10} tickLine={false} label={{ value: 'Forecast Horizon (Months)', position: 'insideBottom', offset: -5, fill: TEXT_MUTED, fontSize: 10 }} />
        <YAxis stroke={TEXT_MUTED} fontSize={10} tickLine={false} domain={[0, 1]} label={{ value: 'Correlation (r)', angle: -90, position: 'insideLeft', fill: TEXT_MUTED, fontSize: 10 }} />
        <Tooltip 
           contentStyle={{ backgroundColor: '#0f1419', borderColor: '#334155', color: '#f8fafc' }}
        />
        <Legend verticalAlign="top" height={36} />
        <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Skill Threshold', fill: '#ef4444', fontSize: 9 }} />
        <Line type="monotone" dataKey="traditional" name="Traditional Models" stroke="#64748b" strokeWidth={2} dot={{r:3}} />
        <Line type="monotone" dataKey="burgamots" name="BURGAMOTS" stroke={GREEN} strokeWidth={3} dot={{r:3}} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

// --- 5. Granger Causality ---
const grangerData = [
    { lag: 1, fStat: 2.1 },
    { lag: 2, fStat: 3.2 },
    { lag: 3, fStat: 4.5 }, // Significant
    { lag: 4, fStat: 5.8 }, // Peak Significance
    { lag: 5, fStat: 5.1 },
    { lag: 6, fStat: 4.2 },
    { lag: 8, fStat: 2.5 },
];

export const GrangerChart = () => (
    <div className="h-[200px] w-full bg-black/20 rounded-lg p-2 border border-white/5">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={grangerData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
          <XAxis dataKey="lag" stroke={TEXT_MUTED} fontSize={10} tickLine={false} label={{ value: 'Lag (Years)', position: 'insideBottom', offset: -5, fill: TEXT_MUTED, fontSize: 10 }} />
          <YAxis stroke={TEXT_MUTED} fontSize={10} tickLine={false} />
          <ReferenceLine y={4.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Significance (p<0.01)', fill: '#ef4444', fontSize: 9, position: 'insideTopLeft' }} />
          <Bar dataKey="fStat" fill={GOLD} radius={[2, 2, 0, 0]} name="F-Statistic" />
        </BarChart>
      </ResponsiveContainer>
    </div>
);