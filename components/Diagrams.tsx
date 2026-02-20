// --- System Architecture Diagram ---
export const SystemArchDiagram = () => (
    <svg 
        viewBox="0 0 800 400" 
        className="w-full h-auto bg-black/20 rounded-xl border border-white/10 p-2"
        role="img" 
        aria-label="System Architecture Diagram: Data flows from JPL Horizons (Ephemeris), SDO Archives (Magnetograms), and ERA5 (Reanalysis) into the DeepXDE PINN Engine. The engine uses MHD and Navier-Stokes equations to produce Solar and Atmospheric Forecasts."
    >
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
        </defs>
        
        {/* Data Sources */}
        <g transform="translate(50, 50)">
            <rect x="0" y="0" width="120" height="60" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
            <text x="60" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">JPL Horizons</text>
            <text x="60" y="50" textAnchor="middle" fill="#94a3b8" fontSize="10">Ephemeris</text>
        </g>
        <g transform="translate(50, 150)">
            <rect x="0" y="0" width="120" height="60" rx="8" fill="#1e293b" stroke="#d4af37" strokeWidth="2" />
            <text x="60" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">SDO Archives</text>
            <text x="60" y="50" textAnchor="middle" fill="#94a3b8" fontSize="10">Magnetograms</text>
        </g>
        <g transform="translate(50, 250)">
            <rect x="0" y="0" width="120" height="60" rx="8" fill="#1e293b" stroke="#22c55e" strokeWidth="2" />
            <text x="60" y="35" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">ERA5</text>
            <text x="60" y="50" textAnchor="middle" fill="#94a3b8" fontSize="10">Reanalysis</text>
        </g>

        {/* Central Engine */}
        <g transform="translate(300, 100)">
            <rect x="0" y="0" width="200" height="200" rx="16" fill="#0f1419" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" />
            <text x="100" y="30" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="bold">DeepXDE PINN</text>
            
            <rect x="20" y="60" width="160" height="30" rx="4" fill="#334155" />
            <text x="100" y="80" textAnchor="middle" fill="white" fontSize="10">MHD Equations (Induction)</text>
            
            <rect x="20" y="100" width="160" height="30" rx="4" fill="#334155" />
            <text x="100" y="120" textAnchor="middle" fill="white" fontSize="10">Navier-Stokes (Momentum)</text>
            
            <rect x="20" y="140" width="160" height="30" rx="4" fill="#d4af37" fillOpacity="0.2" stroke="#d4af37" />
            <text x="100" y="160" textAnchor="middle" fill="#d4af37" fontSize="10">Gravitational Forcing (Source)</text>
        </g>

        {/* Outputs */}
        <g transform="translate(600, 80)">
             <rect x="0" y="0" width="140" height="80" rx="8" fill="#1e293b" stroke="#d4af37" strokeWidth="2" />
             <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Solar Forecast</text>
             <text x="70" y="50" textAnchor="middle" fill="#94a3b8" fontSize="10">Cycle Amplitude</text>
             <text x="70" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10">Flare Probability</text>
        </g>
        <g transform="translate(600, 240)">
             <rect x="0" y="0" width="140" height="80" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
             <text x="70" y="30" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Atmos. Forecast</text>
             <text x="70" y="50" textAnchor="middle" fill="#94a3b8" fontSize="10">Rossby Waves</text>
             <text x="70" y="65" textAnchor="middle" fill="#94a3b8" fontSize="10">Blocking Events</text>
        </g>

        {/* Connections */}
        <path d="M170 80 L235 150 L300 150" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        <path d="M170 180 L300 180" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        <path d="M170 280 L235 210 L300 210" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        
        <path d="M500 150 L550 120 L600 120" stroke="#d4af37" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
        <path d="M500 250 L550 280 L600 280" stroke="#3b82f6" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
    </svg>
);

// --- PINN Architecture ---
export const PINNDiagram = () => (
    <svg viewBox="0 0 500 300" className="w-full h-auto bg-black/20 rounded-xl border border-white/10 p-2">
         <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:'#1e293b', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#334155', stopOpacity:1}} />
            </linearGradient>
        </defs>

        {/* Inputs */}
        <circle cx="50" cy="80" r="15" fill="#3b82f6" />
        <text x="35" y="85" fill="white" fontSize="10" textAnchor="middle">t</text>
        <circle cx="50" cy="150" r="15" fill="#3b82f6" />
        <text x="35" y="155" fill="white" fontSize="10" textAnchor="middle">x,y</text>
        <circle cx="50" cy="220" r="15" fill="#d4af37" />
        <text x="35" y="225" fill="white" fontSize="10" textAnchor="middle">G(t)</text>

        {/* Hidden Layers */}
        {[1, 2, 3, 4].map(layer => (
            <g key={layer} transform={`translate(${80 + layer * 60}, 0)`}>
                <rect x="0" y="50" width="20" height="200" rx="4" fill="url(#grad1)" stroke="#64748b" />
                <text x="10" y="270" textAnchor="middle" fill="#94a3b8" fontSize="8">H{layer}</text>
                {/* Connections */}
                {[0, 1, 2].map(i => (
                    <line key={i} x1="-40" y1={80 + i * 70} x2="0" y2={100} stroke="#64748b" strokeWidth="0.5" opacity="0.5" />
                ))}
            </g>
        ))}

        {/* Output */}
        <circle cx="450" cy="150" r="20" fill="#22c55e" />
        <text x="450" y="155" fill="white" fontSize="12" fontWeight="bold" textAnchor="middle">u(x,t)</text>

        {/* Loss Functions */}
        <g transform="translate(150, 20)">
            <text x="0" y="0" fill="#94a3b8" fontSize="10">Loss = MSE_data + MSE_physics + MSE_barycentric</text>
        </g>
    </svg>
);

// --- Coupling Mechanism ---
export const CouplingDiagram = () => (
    <svg viewBox="0 0 600 200" className="w-full h-auto bg-black/20 rounded-xl border border-white/10 p-4">
        {/* Sun */}
        <circle cx="80" cy="100" r="40" fill="#d4af37" />
        <text x="80" y="105" textAnchor="middle" fill="#0f1419" fontWeight="bold" fontSize="12">SUN</text>
        
        {/* Arrow 1 */}
        <path d="M130 100 L200 100" stroke="#d4af37" strokeWidth="4" markerEnd="url(#arrowhead)" />
        <text x="165" y="90" textAnchor="middle" fill="#d4af37" fontSize="10">Tachocline Shear</text>

        {/* Coupling Box */}
        <rect x="210" y="50" width="180" height="100" rx="8" fill="#1e293b" stroke="#ffffff" strokeWidth="1" strokeDasharray="4 4" />
        <text x="300" y="80" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Barycentric Torque</text>
        <text x="300" y="100" textAnchor="middle" fill="#94a3b8" fontSize="10">Angular Momentum Transfer</text>
        <text x="300" y="120" textAnchor="middle" fill="#94a3b8" fontSize="10">∇ × (v × B)</text>

        {/* Arrow 2 */}
        <path d="M400 100 L470 100" stroke="#3b82f6" strokeWidth="4" markerEnd="url(#arrowhead)" />
        <text x="435" y="90" textAnchor="middle" fill="#3b82f6" fontSize="10">Jet Stream Mod.</text>

        {/* Earth */}
        <circle cx="520" cy="100" r="30" fill="#3b82f6" />
        <text x="520" y="105" textAnchor="middle" fill="white" fontWeight="bold" fontSize="10">EARTH</text>
    </svg>
);

// --- Pipeline Schematic ---
export const PipelineDiagram = () => (
    <svg viewBox="0 0 600 100" className="w-full h-auto bg-black/20 rounded-xl border border-white/10 p-2">
         {[
             { l: 'Ingestion', x: 50 },
             { l: 'Cleaning', x: 180 },
             { l: 'Alignment', x: 310 },
             { l: 'Feature Eng.', x: 440 }
         ].map((step, i) => (
             <g key={i}>
                <rect x={step.x} y="30" width="100" height="40" rx="4" fill="#334155" stroke="#64748b" />
                <text x={step.x + 50} y="55" textAnchor="middle" fill="white" fontSize="10">{step.l}</text>
                {i < 3 && <path d={`M${step.x + 105} 50 L${step.x + 125} 50`} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />}
             </g>
         ))}
    </svg>
);

// --- Kepler Geometry ---
export const KeplerDiagram = () => (
    <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full opacity-40 group-hover:opacity-60 transition-opacity duration-700" preserveAspectRatio="xMidYMid slice">
        <defs>
            <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
            </linearGradient>
        </defs>
        
        <g transform="translate(200, 150)">
             {/* Center */}
            <circle r="4" fill="#d4af37" className="animate-pulse" />
            
            {/* Layer 1 */}
            <circle r="40" stroke="#a855f7" strokeWidth="1" fill="none" opacity="0.3" />
            <path d="M0 -40 L34.6 20 L-34.6 20 Z" stroke="#c084fc" strokeWidth="0.5" fill="none" opacity="0.3" transform="rotate(180)">
                <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="60s" repeatCount="indefinite" />
            </path>

            {/* Layer 2 */}
            <circle r="70" stroke="#a855f7" strokeWidth="1" fill="none" opacity="0.3" />
            <rect x="-49.5" y="-49.5" width="99" height="99" stroke="#c084fc" strokeWidth="0.5" fill="none" opacity="0.2">
                 <animateTransform attributeName="transform" type="rotate" from="45" to="405" dur="120s" repeatCount="indefinite" />
            </rect>

            {/* Layer 3 */}
            <circle r="100" stroke="#a855f7" strokeWidth="1" fill="none" opacity="0.3" />
             <polygon points="0,-100 95,-31 59,81 -59,81 -95,-31" stroke="#c084fc" strokeWidth="0.5" fill="none" opacity="0.2">
                 <animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur="200s" repeatCount="indefinite" />
             </polygon>

            {/* Outer Rims */}
            <circle r="140" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="4 4" fill="none" opacity="0.2" />
        </g>
    </svg>
);