import React from 'react';
import { Activity, Wind, Radio } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-20 lg:py-0 bg-deep-space">
      {/* Dynamic CSS Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Deep radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cosmic-blue/30 via-deep-space to-black"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(212,175,55,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Orbital Rings Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-white/5 rounded-full opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-1.5 bg-solar-gold/10 border border-solar-gold/30 rounded-full backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-solar-gold animate-pulse mr-2"></span>
                <span className="text-xs font-semibold text-solar-gold tracking-wide uppercase">The BURGAMOTS Survey</span>
              </div>
              
              <h1 className="font-serif text-4xl lg:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-stellar-white via-white to-solar-gold/80 drop-shadow-sm">
                Barycentric Unified Resonance of Gravitational-Atmospheric Systems
              </h1>
              
              <p className="text-lg lg:text-xl text-nebula-gray font-light max-w-2xl leading-relaxed">
                A deterministic framework for heliospheric prediction addressing stochastic model failures through integrated gravitational forcing and Physics-Informed Neural Networks.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: <Activity className="text-solar-gold" size={16} />, label: "Magnetohydrodynamics" },
                { icon: <Wind className="text-blue-400" size={16} />, label: "Navier-Stokes" },
                { icon: <Radio className="text-green-400" size={16} />, label: "Rossby Resonance" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
                  {item.icon}
                  <span className="text-sm text-gray-300 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-solar-gold/20 backdrop-blur-md hover:border-solar-gold/40 transition-colors shadow-2xl">
              <h3 className="font-serif text-lg font-bold text-solar-gold mb-4 border-b border-solar-gold/10 pb-2">Key Performance Metrics</h3>
              <div className="space-y-5">
                {[
                  { label: "Prediction Accuracy", value: "r > 0.85" },
                  { label: "RMSE Threshold", value: "< 10%" },
                  { label: "Granger Causality", value: "p < 0.001" }
                ].map((stat, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{stat.label}</span>
                    <span className="text-solar-gold font-bold font-mono">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-solar-gold/20 to-transparent border border-solar-gold/20 backdrop-blur-md shadow-xl">
              <h3 className="font-serif text-lg font-bold text-white mb-2">Impact Potential</h3>
              <div className="text-4xl font-bold text-solar-gold mb-2">$2T</div>
              <p className="text-xs text-gray-400">Potential economic damage prevention from accurate Carrington-level event prediction.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;