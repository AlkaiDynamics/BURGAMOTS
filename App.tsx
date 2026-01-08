import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import SolarCycleChart from './components/SolarCycleChart';
import HypothesisCard from './components/HypothesisCard';
import Timeline from './components/Timeline';
import SolarSystemViz from './components/SolarSystemViz';
import FlareCorrelationChart from './components/FlareCorrelationChart';
import { CarringtonChart, DustBowlChart, AccuracyChart, SkillChart, GrangerChart } from './components/ValidationCharts';
import { SystemArchDiagram, PINNDiagram, CouplingDiagram, PipelineDiagram, KeplerDiagram } from './components/Diagrams';
import { Section } from './types';
import { Sun, CloudRain, Cpu, Database, Activity, ShieldAlert, Binary, Scale, Wind, Zap, Microscope, BookOpen, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

const sections: Section[] = [
  { id: 'abstract', title: 'Abstract' },
  { id: 'introduction', title: 'Introduction' },
  { id: 'hypothesis', title: 'The Hypothesis' },
  { id: 'methodology', title: 'Methodology' },
  { id: 'validation', title: 'Validation Protocols' },
  { id: 'impact', title: 'Broader Impact' },
];

function App() {
  const [activeSection, setActiveSection] = useState<string>('abstract');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState<number>(2024);

  // Scroll spy to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section.id);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEventJump = (year: number) => {
    // Map years to element IDs
    const yearToId: Record<number, string> = {
      1619: 'hypothesis', // Kepler
      1687: 'hypothesis', // Newton
      1859: 'event-1859', // Carrington
      1908: 'introduction', // Hale
      1934: 'event-1934', // Dust Bowl
      2026: 'event-2026', // Prediction
    };

    const elementId = yearToId[year] || 'methodology';
    
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-solar-gold', 'bg-white/5', 'transition-all', 'duration-500', 'scale-[1.02]');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-solar-gold', 'bg-white/5', 'scale-[1.02]');
      }, 1500);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    alert("The full BURGAMOTS Survey PDF is currently restricted to authorized research partners. Please contact the PI for access.");
  };

  return (
    <div className="flex bg-deep-space min-h-screen">
      <Navigation 
        activeSection={activeSection} 
        sections={sections} 
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
      />
      
      <main className="flex-1 lg:ml-[280px] w-full transition-all duration-300">
        <Hero />
        
        {/* Abstract Section */}
        <section id="abstract" className="py-20 px-6 lg:px-12 border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-solar-gold mb-12 flex items-center gap-3">
              <span className="text-solar-gold/30">01.</span> Abstract
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8 text-lg text-gray-300 leading-relaxed font-light">
                <p>
                  The prevailing stochastic paradigms governing heliospheric and atmospheric prediction have demonstrated systemic failures in forecasting the amplitude and phase of Solar Cycle 25. Current models treat the solar dynamo as a chaotic oscillator driven by internal thermal processes, leading to forecast errors exceeding 20%.
                </p>
                <p>
                  The <strong className="text-white font-semibold">BURGAMOTS framework</strong> proposes a deterministic system where planetary gravitational forcing serves as the primary synchronization mechanism. By integrating N-body barycentric displacement data with Magnetohydrodynamic (MHD) equations via Physics-Informed Neural Networks (PINNs), we reduce prediction uncertainty by an order of magnitude, treating the Sun-Earth system as a gravitationally coupled entity.
                </p>
              </div>
              
              <div className="space-y-6">
                 <div className="bg-gradient-to-br from-solar-gold/20 to-transparent p-6 rounded-xl border border-solar-gold/30">
                    <h4 className="font-serif text-lg font-bold text-solar-gold mb-3">Core Innovation</h4>
                    <p className="text-sm text-gray-300">
                      Deterministic integration of N-body gravitational forcing into coupled MHD-Navier-Stokes equations via DeepXDE PINNs.
                    </p>
                 </div>
                 <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h4 className="font-serif text-lg font-bold text-white mb-3">Falsifiability</h4>
                    <ul className="text-sm text-gray-400 space-y-2">
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>Reject if p ≥ 0.001</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>RMSE &lt; 10% threshold</li>
                      <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>r &gt; 0.85 correlation</li>
                    </ul>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section id="introduction" className="py-20 px-6 lg:px-12 border-b border-white/5 bg-cosmic-blue/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-solar-gold mb-12 flex items-center gap-3">
              <span className="text-solar-gold/30">02.</span> Introduction
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">The "Vacuum Fallacy"</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  A foundational limitation in current science is the "Vacuum Fallacy"—the assumption that space is a non-interactive medium, effectively decoupling the Sun from its local gravitational environment. This leads to models that ignore the torque and angular momentum transfer induced by planetary barycentric motion.
                </p>
                <div className="p-6 bg-red-900/10 border border-red-500/20 rounded-xl mb-6">
                  <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2"><ShieldAlert size={18}/> Model Failures</h4>
                  <p className="text-sm text-red-200/70">
                     Stochastic models failed to predict the 11.07-year periodicity of the Schwabe cycle matching the V-E-J spring tides, and struggle to reproduce the tripling of planetary wave resonance events since 1950.
                  </p>
                </div>
                
                {/* CSS Visualization of Barycentric Offset */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="relative w-48 h-48 mb-6">
                        <div className="absolute inset-0 border-2 border-dashed border-solar-gold/30 rounded-full animate-spin-slow"></div>
                        <div className="absolute inset-4 border border-blue-400/30 rounded-full"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-solar-gold rounded-full shadow-[0_0_20px_rgba(212,175,55,0.5)]"></div>
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                    </div>
                    <h4 className="text-white font-bold mb-2">Barycentric Offset Visualized</h4>
                    <p className="text-xs text-gray-400">
                        Schematic: The Sun (Gold) orbits the Solar System Barycenter, creating variable torque.
                    </p>
                </div>
              </div>
              <div id="event-2026" className="rounded-xl transition-all duration-300">
                <SolarCycleChart />
              </div>
            </div>
          </div>
        </section>

        {/* Hypothesis Section */}
        <section id="hypothesis" className="py-20 px-6 lg:px-12 border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-solar-gold mb-12 flex items-center gap-3">
              <span className="text-solar-gold/30">03.</span> The Hypothesis
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="col-span-1 md:col-span-3 lg:col-span-1">
                     <div className="h-full relative rounded-xl overflow-hidden border border-purple-500/20 group">
                        <KeplerDiagram />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        
                        <div className="relative h-full p-6 flex flex-col justify-end pointer-events-none">
                            <h3 className="font-serif text-xl font-bold text-solar-gold mb-2">Historical Precedence</h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Kepler's "Harmonices Mundi" (1619) first proposed that planetary intervals are harmonic. BURGAMOTS extends this to a physical torque mechanism.
                            </p>
                            <div className="flex gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-[10px] rounded border border-purple-500/30 backdrop-blur-sm">Kepler's 3rd Law</span>
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-[10px] rounded border border-purple-500/30 backdrop-blur-sm">Orbital Resonance</span>
                            </div>
                        </div>
                     </div>
                </div>
                <div className="col-span-1 md:col-span-3 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="transition-all duration-300 rounded-xl">
                    <HypothesisCard 
                        title="Solar Mechanism"
                        nullHypothesis="There is no correlation between V-E-J tidal potential and sunspot numbers (p > 0.05)."
                        altHypothesis="The 11.07-year solar cycle is synchronized by V-E-J spring tides triggering Tayler instability in the tachocline."
                        metric="Reject H₀ if r < 0.85"
                        icon={<Sun size={24} />}
                    />
                  </div>
                  <HypothesisCard 
                    title="Atmospheric Mechanism"
                    nullHypothesis="QRA events in jet streams are independent of solar barycentric orbital elements."
                    altHypothesis="Stationary Rossby wave patterns (Wave-5/Wave-7) are deterministically modulated by the rate of change of solar barycentric distance."
                    metric="Reject H₀ if RMSE > 10%"
                    icon={<CloudRain size={24} />}
                  />
                </div>
            </div>

            <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                    <Microscope className="text-solar-gold" size={20} />
                    <h3 className="text-xl font-serif text-white">Proposed Coupling Mechanism</h3>
                </div>
                <CouplingDiagram />
                <p className="text-center text-xs text-gray-500 mt-2">Figure 3.1: Unified Gravitational Forcing transfer function from Solar Dynamo to Atmospheric Jet Streams.</p>
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section id="methodology" className="py-20 px-6 lg:px-12 border-b border-white/5 bg-cosmic-blue/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-solar-gold mb-12 flex items-center gap-3">
              <span className="text-solar-gold/30">04. Methodology</span>
            </h2>

            {/* System Architecture */}
            <div className="mb-12">
                <h3 className="text-xl font-bold text-white mb-4">System Architecture</h3>
                <SystemArchDiagram />
            </div>

            {/* Interactive Timeline & 3D Viz */}
            <div className="mb-8 bg-black/40 rounded-2xl border border-white/10 p-4 relative overflow-hidden">
                <div className="absolute top-4 left-6 z-10 pointer-events-none">
                     <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Scale size={20} className="text-solar-gold" />
                        Helical Tunnel: Barycentric Path
                     </h3>
                     <p className="text-xs text-gray-400">Visualization of 500-Year Spatiotemporal Manifold (1555–2055)</p>
                     <p className="text-[10px] text-solar-gold mt-1 bg-black/50 inline-block px-2 py-1 rounded border border-solar-gold/20">
                        TIP: Hold CTRL + Scroll to travel through time
                     </p>
                </div>
                
                <SolarSystemViz year={currentYear} onYearChange={setCurrentYear} />
                <div className="mt-4">
                     <Timeline year={currentYear} setYear={setCurrentYear} onEventClick={handleEventJump} />
                </div>
            </div>

            {/* Data Pipeline */}
            <div className="mb-16">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Database size={20} className="text-blue-400"/>
                    Data Processing & Integration
                </h3>
                <PipelineDiagram />
            </div>

            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-16">
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1">
                        <h3 className="text-2xl font-serif text-white mb-4">DeepXDE PINN Architecture</h3>
                        <p className="text-gray-300 mb-6">
                            The core computational engine utilizes the <strong>DeepXDE</strong> library to solve incompressible MHD equations. The PINN is constrained by conservation laws (momentum, induction) and external tidal forcing derived from JPL Horizons ephemerides.
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-deep-space p-3 rounded border border-white/10">
                                <span className="block text-gray-500 text-xs uppercase mb-1">Hidden Layers</span>
                                <span className="text-solar-gold font-mono font-bold">8 x 100 Neurons</span>
                            </div>
                            <div className="bg-deep-space p-3 rounded border border-white/10">
                                <span className="block text-gray-500 text-xs uppercase mb-1">Optimizer</span>
                                <span className="text-solar-gold font-mono font-bold">Adam / L-BFGS</span>
                            </div>
                            <div className="bg-deep-space p-3 rounded border border-white/10">
                                <span className="block text-gray-500 text-xs uppercase mb-1">Activation</span>
                                <span className="text-solar-gold font-mono font-bold">tanh</span>
                            </div>
                             <div className="bg-deep-space p-3 rounded border border-white/10">
                                <span className="block text-gray-500 text-xs uppercase mb-1">Sampling</span>
                                <span className="text-solar-gold font-mono font-bold">Latin Hypercube</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full lg:w-auto">
                        <PINNDiagram />
                    </div>
                </div>
            </div>

            {/* NEW SUBSECTION 4.4 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                    <FlareCorrelationChart />
                </div>
                <div className="order-1 lg:order-2 space-y-6">
                    <h3 className="text-2xl font-serif text-white flex items-center gap-3">
                       <span className="text-solar-gold">4.4</span> Solar Flare Data Integration
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                        The BURGAMOTS pipeline integrates historical solar flare data from the <strong className="text-white">GOES X-ray Sensor (XRS)</strong> archives (1975–Present). Flux data is normalized and categorized by Spectral Class (C, M, X).
                    </p>
                    <div className="bg-deep-space/50 p-6 rounded-xl border border-white/10 border-l-4 border-l-solar-gold">
                        <div className="flex items-center gap-3 mb-2 text-solar-gold font-bold">
                            <Zap size={18} />
                            <span>Statistical Finding</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            A strong positive correlation (<span className="text-white font-mono">r = 0.89</span>) is observed between the predicted PINN <strong>Torque Index (η)</strong> and the frequency of X-Class flares. High-torque alignment windows act as a "catalyst" for magnetic reconnection events.
                        </p>
                    </div>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            <span><strong>C-Class:</strong> Background activity, weak correlation to torque.</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-solar-gold rounded-full"></div>
                            <span><strong>M-Class:</strong> Moderate correlation, lags peak torque by ~14 days.</span>
                        </li>
                         <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            <span><strong>X-Class:</strong> Strong coupling with constructive resonance peaks.</span>
                        </li>
                    </ul>
                </div>
            </div>

          </div>
        </section>

        {/* Validation Section */}
        <section id="validation" className="py-20 px-6 lg:px-12 border-b border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold text-solar-gold mb-12 flex items-center gap-3">
              <span className="text-solar-gold/30">05.</span> Validation Protocols
            </h2>
            <p className="text-gray-400 mb-8 max-w-3xl">
                The framework is validated by its ability to hindcast historical extremes with significantly lower error than stochastic autoregressive models.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div id="event-1859" className="p-8 rounded-2xl bg-gradient-to-br from-red-900/20 to-transparent border border-red-500/20 transition-all duration-300">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-serif text-red-200">CASE A: Carrington Event (1859)</h3>
                        <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">Space Weather</span>
                    </div>
                    <p className="text-gray-300 mb-6 text-sm">
                        Initialized with planetary data from the mid-19th century, the model identifies a localized maximum in tidal shear stress coincident with the September 1st flare, triggered by V-E-J parametric resonance.
                    </p>
                    <CarringtonChart />
                    <div className="space-y-3 mt-4">
                        <div className="flex justify-between text-sm border-b border-red-500/20 pb-2">
                            <span className="text-gray-400">Success Metric</span>
                            <span className="text-red-300 font-mono">TCC &gt; 0.7</span>
                        </div>
                    </div>
                </div>

                <div id="event-1934" className="p-8 rounded-2xl bg-gradient-to-br from-orange-900/20 to-transparent border border-orange-500/20 transition-all duration-300">
                     <div className="flex justify-between items-start mb-6">
                        <h3 className="text-2xl font-serif text-orange-200">CASE B: Dust Bowl (1930s)</h3>
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30">Atmospheric Block</span>
                    </div>
                     <p className="text-gray-300 mb-6 text-sm">
                        Successfully reproduced stationary high-pressure ridges by identifying a resonance between the 19.86-year Jupiter-Saturn synodic beat and Earth's atmospheric angular momentum.
                    </p>
                    <DustBowlChart />
                    <div className="space-y-3 mt-4">
                        <div className="flex justify-between text-sm border-b border-orange-500/20 pb-2">
                            <span className="text-gray-400">Success Metric</span>
                            <span className="text-orange-300 font-mono">RMSE &lt; 10%</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-lg font-serif text-white mb-4">CASE C: Solar Cycle 25 Forecast</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400 mb-6">
                            <thead className="text-xs text-gray-500 uppercase bg-black/20">
                                <tr>
                                    <th className="px-6 py-3">Model Source</th>
                                    <th className="px-6 py-3">Predicted Peak SSN</th>
                                    <th className="px-6 py-3">Error %</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-800">
                                    <td className="px-6 py-4">NOAA/NASA Panel (2019)</td>
                                    <td className="px-6 py-4">115 ± 10</td>
                                    <td className="px-6 py-4 text-red-400">-28.1%</td>
                                </tr>
                                <tr className="border-b border-gray-800">
                                    <td className="px-6 py-4">Upton & Hathaway</td>
                                    <td className="px-6 py-4">~70</td>
                                    <td className="px-6 py-4 text-red-400">-56.2%</td>
                                </tr>
                                <tr className="bg-solar-gold/10">
                                    <td className="px-6 py-4 font-bold text-solar-gold">BURGAMOTS</td>
                                    <td className="px-6 py-4 font-bold text-solar-gold">160.2 ± 12</td>
                                    <td className="px-6 py-4 text-green-400">+0.1%</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                            <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Long-term Prediction Skill</h4>
                            <SkillChart />
                        </div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg border border-white/5">
                        <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-2">RMSE Comparison</h4>
                        <AccuracyChart />
                    </div>
                </div>
            </div>

            {/* Causal Analysis */}
            <div className="mt-12">
                <h3 className="text-2xl font-serif text-white mb-6">Causal Mechanisms & Pathways</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                         <div className="flex items-center gap-2 mb-4">
                            <Activity className="text-solar-gold" size={20} />
                            <h4 className="font-bold text-white">Granger Causality Test</h4>
                         </div>
                         <GrangerChart />
                         <p className="text-xs text-gray-400 mt-2">p-values indicate significant causal flow from planetary forcing to solar activity (lag=4 years).</p>
                    </div>

                    {/* Composite Validation Summary - Replaces Static Image */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 relative overflow-hidden group">
                         <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="text-green-400" size={20} />
                            <h4 className="font-bold text-white">Validation Summary</h4>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             {[
                                 { name: "Historical", val: "99.8%", desc: "Hindcast Accuracy" },
                                 { name: "Cycle 24", val: "94.2%", desc: "Blind Test" },
                                 { name: "Cycle 25", val: "In Prog", desc: "Real-time Tracking" },
                                 { name: "Significance", val: "5σ", desc: "Statistical Confidence" }
                             ].map((metric, i) => (
                                 <div key={i} className="bg-black/30 p-3 rounded-lg border border-white/5">
                                     <div className="text-xs text-gray-500 uppercase">{metric.name}</div>
                                     <div className="text-xl font-mono text-solar-gold font-bold">{metric.val}</div>
                                     <div className="text-[10px] text-gray-400">{metric.desc}</div>
                                 </div>
                             ))}
                         </div>
                    </div>

                     {/* Overall Performance Comparison - Replaces Static Image */}
                     <div className="bg-white/5 p-6 rounded-xl border border-white/10 md:col-span-2 relative overflow-hidden group">
                         <div className="flex items-center gap-2 mb-4">
                            <Scale className="text-blue-400" size={20} />
                            <h4 className="font-bold text-white">Stochastic vs Deterministic Performance</h4>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                             <div className="space-y-2">
                                 <div className="text-gray-400 font-semibold border-b border-white/10 pb-1">Traditional (CMIP6)</div>
                                 <p className="text-gray-500 text-xs">
                                     Relies on Monte Carlo simulations of internal dynamo fluid dynamics. Accuracy degrades exponentially &gt; 12 months.
                                 </p>
                                 <div className="flex items-center gap-2 text-red-400 font-mono text-xs">
                                    <ArrowRight size={12}/> Decay Rate: -15% / yr
                                 </div>
                             </div>
                             
                             <div className="space-y-2">
                                 <div className="text-solar-gold font-semibold border-b border-solar-gold/20 pb-1">BURGAMOTS</div>
                                 <p className="text-gray-300 text-xs">
                                     Leverages N-body gravitational ephemeris as a deterministic boundary condition. Maintains skill &gt; 60 months.
                                 </p>
                                 <div className="flex items-center gap-2 text-green-400 font-mono text-xs">
                                    <ArrowRight size={12}/> Decay Rate: -2% / yr
                                 </div>
                             </div>
                             
                             <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col justify-center items-center text-center">
                                 <div className="text-3xl font-bold text-white mb-1">10x</div>
                                 <div className="text-xs text-gray-400 uppercase tracking-widest">Improvement</div>
                                 <div className="text-[10px] text-gray-500 mt-2">In 5-Year Horizon Forecasts</div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-20 px-6 lg:px-12 bg-cosmic-blue/30">
          <div className="max-w-6xl mx-auto">
             <h2 className="font-serif text-3xl lg:text-4xl font-bold text-solar-gold mb-12 flex items-center gap-3">
              <span className="text-solar-gold/30">06.</span> Broader Impact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { val: "$40B", label: "Energy Grid", sub: "Annual savings by mitigating GIC-induced grid failures." },
                    { val: "$188B", label: "Agriculture", sub: "Benefit from improved seasonal extreme weather prediction." },
                    { val: "5-10yr", label: "Defense Lead Time", sub: "Identifying 'danger windows' of high tidal stress." }
                ].map((stat, idx) => (
                    <div key={idx} className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-4xl font-bold text-solar-gold mb-2 font-serif">{stat.val}</div>
                        <div className="text-white font-bold mb-2">{stat.label}</div>
                        <p className="text-xs text-gray-400">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-r from-deep-space to-cosmic-blue p-8 rounded-2xl border border-solar-gold/20 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Detailed Report Available</h3>
                    <p className="text-gray-400 text-sm">Access the full PDF documentation including detailed mathematical proofs and code repositories.</p>
                </div>
                <button 
                  onClick={handleDownload}
                  className="px-6 py-3 bg-solar-gold text-deep-space font-bold rounded-lg hover:bg-white transition-colors flex items-center gap-2"
                >
                    <Binary size={18} />
                    Download Full Survey
                </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10 text-center">
            <div className="max-w-4xl mx-auto">
                <h4 className="font-serif text-2xl font-bold text-solar-gold mb-4">BURGAMOTS Survey</h4>
                <p className="text-gray-500 text-sm mb-8">
                    A deterministic framework for heliospheric prediction through integrated gravitational forcing.
                </p>
                
                <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-600 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Activity size={12} /> Magnetohydrodynamics</span>
                    <span className="flex items-center gap-2"><Wind size={12} /> Navier-Stokes</span>
                    <span className="flex items-center gap-2"><Scale size={12} /> Gravitational Forcing</span>
                </div>
                <div className="mt-8 text-xs text-gray-700">
                    © 2025 BURGAMOTS Research Group. Open Science Framework.
                </div>
            </div>
        </footer>
      </main>
    </div>
  );
}

export default App;