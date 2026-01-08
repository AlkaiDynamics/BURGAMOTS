import React from 'react';
import { Menu, X, BookOpen, Activity, Globe, Database, CheckCircle, Zap } from 'lucide-react';
import { Section } from '../types';

interface NavigationProps {
  activeSection: string;
  sections: Section[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, sections, isOpen, setIsOpen }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'abstract': return <BookOpen size={18} />;
      case 'introduction': return <Activity size={18} />;
      case 'hypothesis': return <Globe size={18} />;
      case 'methodology': return <Database size={18} />;
      case 'validation': return <CheckCircle size={18} />;
      case 'impact': return <Zap size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-cosmic-blue text-solar-gold p-3 rounded-lg border border-solar-gold/30 shadow-lg backdrop-blur-sm"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <nav className={`
        fixed top-0 left-0 h-screen w-[280px] bg-deep-space/95 backdrop-blur-md 
        border-r border-solar-gold/20 z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 h-full flex flex-col overflow-y-auto">
          <div className="mb-8">
            <h3 className="font-serif text-xl font-bold text-solar-gold mb-2">Contents</h3>
            <div className="h-0.5 w-12 bg-solar-gold/50"></div>
          </div>

          <ul className="space-y-2 flex-1">
            {sections.map((section, index) => (
              <li key={section.id}>
                <button
                  onClick={() => handleNavClick(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeSection === section.id 
                      ? 'bg-solar-gold/10 text-solar-gold border-l-2 border-solar-gold' 
                      : 'text-gray-400 hover:bg-solar-gold/5 hover:text-solar-gold/80'}
                  `}
                >
                  <span className={activeSection === section.id ? 'text-solar-gold' : 'text-gray-500'}>
                    {getIcon(section.id)}
                  </span>
                  {index + 1}. {section.title}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-8 border-t border-solar-gold/20">
            <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider font-semibold">Research Metrics</p>
            <div className="space-y-3 text-xs text-gray-400">
              <div className="flex justify-between items-center">
                <span>Confidence</span>
                <span className="text-solar-gold font-mono">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>RMSE Target</span>
                <span className="text-solar-gold font-mono">&lt;10%</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Causality (p)</span>
                <span className="text-solar-gold font-mono">&lt;0.001</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;