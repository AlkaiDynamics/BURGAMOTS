import React from 'react';
import { Database, Sun, Globe, MousePointer2 } from 'lucide-react';

interface TimelineProps {
  year: number;
  setYear: (year: number) => void;
  onEventClick?: (year: number) => void;
}

interface Dataset {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
  icon: React.ReactNode;
  description: string;
}

const datasets: Dataset[] = [
  { 
    id: 'jpl', 
    name: 'NASA JPL Horizons', 
    start: 1900, 
    end: 2025, 
    color: '#3b82f6', // Blue
    icon: <Database size={16} />,
    description: "Planetary ephemeris"
  },
  { 
    id: 'era5', 
    name: 'ERA5 Reanalysis', 
    start: 1950, 
    end: 2025, 
    color: '#22c55e', // Green
    icon: <Globe size={16} />,
    description: "Atmospheric dynamics"
  },
  { 
    id: 'sdo', 
    name: 'SDO Archives', 
    start: 2010, 
    end: 2025, 
    color: '#d4af37', // Gold
    icon: <Sun size={16} />,
    description: "Magnetograms"
  },
];

const MIN_YEAR = 1555;
const MAX_YEAR = 2055;
const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;

const Timeline: React.FC<TimelineProps> = ({ year, setYear, onEventClick }) => {
  const getLeftPercent = (val: number) => ((val - MIN_YEAR) / TOTAL_YEARS) * 100;
  const getWidthPercent = (start: number, end: number) => ((end - start) / TOTAL_YEARS) * 100;

  const handleMarkerClick = (evYear: number) => {
    setYear(evYear);
    if (onEventClick) {
      onEventClick(evYear);
    }
  };

  // Determine prediction mode based on year
  let mode = "No Data Coverage";
  let modeColor = "text-gray-500";
  let modeDesc = "Insufficient data for PINN operation.";

  if (year >= 2020) {
    mode = "Future Forecast";
    modeColor = "text-solar-gold";
    modeDesc = "DeepXDE predictive mode active.";
  } else if (year >= 2010) {
    mode = "High-Fidelity Training";
    modeColor = "text-yellow-400";
    modeDesc = "Full multi-modal integration (SDO + Gravity).";
  } else if (year >= 1950) {
    mode = "Atmospheric Reconstruction";
    modeColor = "text-green-400";
    modeDesc = "Coupled Gravity-Atmosphere mode.";
  } else if (year >= 1900) {
    mode = "Gravitational Determinism";
    modeColor = "text-blue-400";
    modeDesc = "Gravity-only mode for long-term cycles.";
  } else if (year === 1859) {
    mode = "Carrington Event (Hindcast)";
    modeColor = "text-red-400";
    modeDesc = "Historical validation: Extreme space weather.";
  } else if (year >= 1645 && year <= 1715) {
    mode = "Maunder Minimum";
    modeColor = "text-blue-300";
    modeDesc = "Low tidal forcing & solar activity.";
  } else if (year === 1619) {
    mode = "Keplerian Resonance";
    modeColor = "text-purple-400";
    modeDesc = "Harmonices Mundi: Foundation of orbital resonance.";
  } else if (year === 1687) {
    mode = "Newtonian Physics";
    modeColor = "text-purple-400";
    modeDesc = "Principia: Universal gravitation laws established.";
  } else {
    mode = "Historical Reconstruction";
    modeDesc = "Pre-instrumental era. Ephemeris data only.";
  }

  const events = [
    { year: 1609, label: "Kepler's Laws", color: "bg-purple-500" },
    { year: 1645, label: "Maunder Min.", color: "bg-blue-400" },
    { year: 1687, label: "Principia", color: "bg-purple-600" },
    { year: 1859, label: "Carrington", color: "bg-red-500" },
    { year: 1908, label: "Hale Cycle", color: "bg-blue-500" },
    { year: 1934, label: "Dust Bowl", color: "bg-orange-500" },
    { year: 2025, label: "Cycle 25 Peak", color: "bg-solar-gold" },
  ];

  return (
    <div className="w-full bg-deep-space/50 border border-white/10 rounded-xl p-6 backdrop-blur-md">
      <div className="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
        <div>
          <h3 className="text-xl font-serif font-bold text-white mb-2">Temporal Data Coverage</h3>
          <p className="text-sm text-gray-400">Drag to visualize planetary resonance history. Click markers for key discoveries.</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-mono font-bold text-white tracking-tighter">
            {year.toFixed(1)}
          </div>
          <div className={`text-sm font-bold uppercase tracking-wider ${modeColor} mt-1`}>
            {mode}
          </div>
          <div className="text-xs text-gray-500 mt-1">{modeDesc}</div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="relative mb-10 select-none pt-4">
        
        {/* Background Grid Lines (Every 50 years) */}
        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 h-24">
          {Array.from({ length: Math.floor(TOTAL_YEARS / 50) + 1 }).map((_, i) => (
            <div key={i} className="h-full border-l border-white text-[10px] text-gray-500 pl-1 pt-16">
              {MIN_YEAR + (i * 50)}
            </div>
          ))}
        </div>

        {/* Scrubber Line */}
        <div 
          className="absolute top-[-10px] h-32 w-0.5 bg-white z-20 shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-75 pointer-events-none"
          style={{ left: `${getLeftPercent(year)}%` }}
        >
          <div className="absolute -top-2 -left-[5px] w-3 h-3 bg-white rounded-full shadow-lg" />
        </div>

        {/* Dataset Tracks */}
        <div className="space-y-3 relative z-10 py-2">
          {datasets.map((ds) => {
            const isActive = year >= ds.start && year <= ds.end;
            return (
              <div key={ds.id} className="relative group h-6">
                <div className="absolute top-2 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300 relative"
                    style={{ 
                      left: `${getLeftPercent(ds.start)}%`,
                      width: `${getWidthPercent(ds.start, ds.end)}%`,
                      backgroundColor: isActive ? ds.color : '#334155',
                      opacity: isActive ? 1 : 0.3
                    }}
                  />
                </div>
                <div className="absolute -top-3 left-0 flex items-center gap-2 text-[10px] text-gray-500">
                    <span className={isActive ? 'text-white' : ''}>{ds.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Events */}
        <div className="relative h-6 mt-6">
            {events.map(ev => (
                <div 
                    key={ev.year}
                    className="group absolute top-0 -translate-x-1/2 flex flex-col items-center cursor-pointer z-30"
                    style={{ left: `${getLeftPercent(ev.year)}%` }}
                    onClick={() => handleMarkerClick(ev.year)}
                >
                    <div className={`w-3 h-3 rounded-full ${ev.color} border border-white/20 shadow-lg group-hover:scale-125 transition-transform mb-1`}></div>
                    <div className="absolute top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap border border-white/10 z-40">
                        {ev.label}
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Slider Control */}
      <div className="relative w-full h-8 flex items-center">
        <input 
          type="range" 
          min={MIN_YEAR} 
          max={MAX_YEAR} 
          step={0.1}
          value={year} 
          onChange={(e) => setYear(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-gold hover:accent-white transition-all z-30"
        />
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 justify-center">
        <MousePointer2 size={12} />
        <span>Drag slider to travel the Barycentric Path (PBJ Visualization)</span>
      </div>
    </div>
  );
};

export default Timeline;