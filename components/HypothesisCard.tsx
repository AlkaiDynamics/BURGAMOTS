import React from 'react';

interface HypothesisCardProps {
  title: string;
  nullHypothesis: string;
  altHypothesis: string;
  metric: string;
  icon?: React.ReactNode;
}

const HypothesisCard: React.FC<HypothesisCardProps> = ({ title, nullHypothesis, altHypothesis, metric, icon }) => {
  return (
    <div className="bg-gradient-to-br from-white/5 to-transparent border border-solar-gold/20 rounded-xl p-6 hover:border-solar-gold/40 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-serif text-xl font-bold text-white group-hover:text-solar-gold transition-colors">{title}</h4>
        {icon && <div className="text-solar-gold/60 bg-solar-gold/10 p-2 rounded-lg">{icon}</div>}
      </div>
      
      <div className="space-y-4">
        <div className="relative pl-4 border-l-2 border-red-500/50">
          <span className="text-xs text-red-400 font-bold uppercase tracking-wider block mb-1">Null Hypothesis (H₀)</span>
          <p className="text-sm text-gray-400 leading-relaxed">{nullHypothesis}</p>
        </div>

        <div className="relative pl-4 border-l-2 border-green-500/50">
            <span className="text-xs text-green-400 font-bold uppercase tracking-wider block mb-1">Alternative Hypothesis (H₁)</span>
          <p className="text-sm text-gray-300 leading-relaxed">{altHypothesis}</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
        <span className="text-gray-500 font-medium">Falsifiability Threshold</span>
        <span className="text-solar-gold font-mono font-bold px-2 py-1 bg-solar-gold/10 rounded">
          {metric}
        </span>
      </div>
    </div>
  );
};

export default HypothesisCard;