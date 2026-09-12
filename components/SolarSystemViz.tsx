import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Activity, Calendar, Clock, Move3d } from 'lucide-react';

interface SolarSystemVizProps {
  year: number;
  onYearChange?: (year: number) => void;
}

interface PlanetVisual {
  name: string;
  radius: number;
  periodYears: number;
  size: number;
  color: number;
  phase: number;
}

const MIN_YEAR = 1555;
const MAX_YEAR = 2055;
const VISUAL_EPOCH = 2000;

const PLANETS: PlanetVisual[] = [
  { name: 'Mercury', radius: 8, periodYears: 0.241, size: 0.7, color: 0x9ca3af, phase: 0.2 },
  { name: 'Venus', radius: 12, periodYears: 0.615, size: 1.0, color: 0xd4af37, phase: 1.1 },
  { name: 'Earth', radius: 17, periodYears: 1.0, size: 1.1, color: 0x3b82f6, phase: 2.0 },
  { name: 'Mars', radius: 22, periodYears: 1.881, size: 0.8, color: 0xef4444, phase: 0.7 },
  { name: 'Jupiter', radius: 31, periodYears: 11.862, size: 2.5, color: 0xd97706, phase: 2.7 },
  { name: 'Saturn', radius: 40, periodYears: 29.457, size: 2.1, color: 0xfcd34d, phase: 1.8 },
  { name: 'Uranus', radius: 49, periodYears: 84.017, size: 1.6, color: 0x22d3ee, phase: 0.4 },
  { name: 'Neptune', radius: 58, periodYears: 164.8, size: 1.6, color: 0x3b82f6, phase: 2.3 },
];

/**
 * Synthetic Cycle Demonstration
 *
 * A dimensionless visual-only blend of two sine terms with periods of
 * 11.07 years and 19.86 years. It is not a measurement, physical forcing,
 * empirical feature, prediction, model output, or scientific result.
 */
function calculateSyntheticCycleIndex(year: number): number {
  const elevenYearTerm = Math.sin(year * (2 * Math.PI / 11.07));
  const nineteenYearTerm = Math.sin(year * (2 * Math.PI / 19.86));
  return ((elevenYearTerm + nineteenYearTerm) / 2 + 1) / 2;
}

function positionFor(planet: PlanetVisual, year: number) {
  const angle = ((year - VISUAL_EPOCH) / planet.periodYears) * Math.PI * 2 + planet.phase;
  return new THREE.Vector3(
    Math.cos(angle) * planet.radius,
    Math.sin(angle * 0.13) * planet.radius * 0.04,
    Math.sin(angle) * planet.radius,
  );
}

const SolarSystemViz: React.FC<SolarSystemVizProps> = ({ year, onYearChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef(year);
  const syntheticIndexRef = useRef(calculateSyntheticCycleIndex(year));
  const [controlMode, setControlMode] = useState<'view' | 'time'>('view');
  const syntheticIndex = calculateSyntheticCycleIndex(year);

  useEffect(() => {
    yearRef.current = year;
    syntheticIndexRef.current = syntheticIndex;
  }, [year, syntheticIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.006);

    const camera = new THREE.PerspectiveCamera(46, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 70, 95);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 35;
    controls.maxDistance = 220;

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const sunLight = new THREE.PointLight(0xffdd99, 5, 300);
    scene.add(sunLight);

    const stars = new THREE.BufferGeometry();
    const starCount = 1600;
    const starPositions = new Float32Array(starCount * 3);
    for (let index = 0; index < starCount; index += 1) {
      const radius = 180 + Math.random() * 250;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[index * 3 + 2] = radius * Math.cos(phi);
    }
    stars.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(stars, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.65 })));

    const sunGroup = new THREE.Group();
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(3.8, 48, 48),
      new THREE.MeshStandardMaterial({ color: 0xffaa33, emissive: 0xff6600, emissiveIntensity: 1.6 }),
    );
    sunGroup.add(sun);
    const visualHalo = new THREE.Mesh(
      new THREE.SphereGeometry(5.2, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 0.08, side: THREE.BackSide }),
    );
    sunGroup.add(visualHalo);
    scene.add(sunGroup);

    const planetMeshes: THREE.Mesh[] = [];
    for (const planet of PLANETS) {
      const orbitPoints: THREE.Vector3[] = [];
      for (let index = 0; index <= 160; index += 1) {
        const angle = (index / 160) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(angle) * planet.radius, 0, Math.sin(angle) * planet.radius));
      }
      scene.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(orbitPoints),
        new THREE.LineBasicMaterial({ color: planet.color, transparent: true, opacity: 0.2 }),
      ));

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(planet.size, 28, 28),
        new THREE.MeshStandardMaterial({ color: planet.color, roughness: 0.75, metalness: 0.05 }),
      );
      mesh.userData.planetName = planet.name;
      scene.add(mesh);
      planetMeshes.push(mesh);
    }

    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const currentYear = yearRef.current;

      PLANETS.forEach((planet, index) => {
        planetMeshes[index].position.copy(positionFor(planet, currentYear));
        planetMeshes[index].rotation.y += 0.003;
      });

      // Visual modulation only. This dimensionless synthetic value is intentionally
      // confined to rendering and is never emitted as evidence or a result manifest.
      const visualIndex = syntheticIndexRef.current;
      const visualScale = 1 + visualIndex * 0.12;
      visualHalo.scale.setScalar(visualScale);
      (visualHalo.material as THREE.MeshBasicMaterial).opacity = 0.04 + visualIndex * 0.08;
      sun.rotation.y += 0.002;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    const wheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !onYearChange) {
        setControlMode('view');
        return;
      }
      event.preventDefault();
      setControlMode('time');
      const step = event.shiftKey ? 10 : 1;
      const next = Math.max(MIN_YEAR, Math.min(MAX_YEAR, yearRef.current + Math.sign(event.deltaY) * step));
      onYearChange(next);
    };

    window.addEventListener('resize', resize);
    container.addEventListener('wheel', wheel, { passive: false });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('wheel', wheel);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) container.removeChild(renderer.domElement);
    };
  }, [onYearChange]);

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden bg-black/90 ring-1 ring-white/10 group">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute top-5 right-5 z-20 w-72 rounded-xl border border-solar-gold/30 bg-black/75 p-4 backdrop-blur-md pointer-events-none">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-solar-gold">
            <Activity size={13} /> Synthetic Cycle Demonstration
          </span>
          <span className="font-mono text-xs text-white">{syntheticIndex.toFixed(2)}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-solar-gold/70" style={{ width: `${syntheticIndex * 100}%` }} />
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
          Dimensionless illustrative harmonic index generated from 11.07-year and 19.86-year sine terms. It is not a measurement, physical forcing, prediction, empirical feature, or validation result.
        </p>
      </div>

      <div className="absolute top-5 left-5 z-20 flex gap-2 pointer-events-none">
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold ${controlMode === 'time' ? 'border-solar-gold bg-solar-gold/20 text-solar-gold' : 'border-white/10 bg-black/50 text-gray-500'}`}>
          <Clock size={13} /> TIME
        </div>
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold ${controlMode === 'view' ? 'border-blue-400 bg-blue-500/20 text-blue-400' : 'border-white/10 bg-black/50 text-gray-500'}`}>
          <Move3d size={13} /> VIEW
        </div>
      </div>

      <div className="absolute bottom-5 left-5 right-5 z-20 rounded-xl border border-white/10 bg-black/65 p-4 backdrop-blur-md">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-400">
              <Calendar size={12} /> Visualization year
            </div>
            <div className="font-mono text-2xl font-bold text-solar-gold">{year.toFixed(1)} <span className="text-xs text-gray-500">CE</span></div>
          </div>
          <p className="max-w-md text-right text-[10px] leading-relaxed text-gray-500">
            Selecting a year changes only this orbital illustration. It does not execute a scientific model, retrieve empirical data, or generate a prediction.
          </p>
        </div>
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          step={0.1}
          value={year}
          onChange={(event) => onYearChange?.(Number(event.target.value))}
          className="w-full h-2 rounded-lg bg-white/10 appearance-none cursor-pointer accent-solar-gold"
          aria-label="Visualization year"
        />
      </div>
    </div>
  );
};

export default SolarSystemViz;
