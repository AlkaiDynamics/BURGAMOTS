import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { Calendar, Move3d, Clock, Settings2, ChevronDown, Activity, Zap } from 'lucide-react';

interface SolarSystemVizProps {
  year: number;
  onYearChange?: (year: number) => void;
}

// --- Astronomical Constants ---
const D2R = Math.PI / 180.0;
const MIN_YEAR = 1555;
const MAX_YEAR = 2055;
const BASE_VISUAL_SCALE = 1.0; // Base Z-axis unit
const ORBIT_SCALE = 22.0; // Increased for better separation

// Resolution for trails - High res for smooth curves
const TRAIL_STEPS = 60000; 

// --- Time Step Options ---
const TIME_STEPS = [
    { label: '12 Hours', value: 0.001369, short: '12h' },
    { label: '24 Hours', value: 0.002738, short: '24h' },
    { label: '7 Days', value: 0.019165, short: '7d' },
    { label: 'Lunar Cycle', value: 0.0808, short: '29.5d' },
    { label: '1 Year', value: 1.0, short: '1y' },
    { label: 'Solar Cycle', value: 11.07, short: '11y' }
];

interface OrbitalElements {
  name: string;
  a: number; e: number; I: number; L: number; w: number; O: number; n: number; mass: number; 
  color: number; size: number; rotationPeriod: number; // Hours
  tilt: number; // Axial tilt in degrees
}

// J2000 Elements with Rotation Periods and Tilt
const PLANETS_DATA: OrbitalElements[] = [
  { name: 'Mercury', a: 0.387, e: 0.2056, I: 7.00, L: 252.25, w: 77.46, O: 48.33, n: 4.0923, mass: 1.66e-7, color: 0x9ca3af, size: 0.8, rotationPeriod: 1407.6, tilt: 0.03 },
  { name: 'Venus',   a: 0.723, e: 0.0068, I: 3.39, L: 181.98, w: 131.57,O: 76.68, n: 1.6021, mass: 2.45e-6, color: 0xd4af37, size: 1.1, rotationPeriod: -5832.5, tilt: 177.4 },
  { name: 'Earth',   a: 1.000, e: 0.0167, I: 0.00, L: 100.46, w: 102.94,O: 0.00,  n: 0.9856, mass: 3.00e-6, color: 0x3b82f6, size: 1.2, rotationPeriod: 23.9, tilt: 23.4 },
  { name: 'Mars',    a: 1.524, e: 0.0934, I: 1.85, L: 355.45, w: 336.04,O: 49.58, n: 0.5240, mass: 3.21e-7, color: 0xef4444, size: 0.9, rotationPeriod: 24.6, tilt: 25.2 },
  { name: 'Jupiter', a: 5.203, e: 0.0484, I: 1.30, L: 34.40,  w: 14.75, O: 100.55,n: 0.0831, mass: 9.54e-4, color: 0xd97706, size: 4.5, rotationPeriod: 9.9, tilt: 3.1 },
  { name: 'Saturn',  a: 9.537, e: 0.0542, I: 2.49, L: 49.94,  w: 92.43, O: 113.72,n: 0.0335, mass: 2.85e-4, color: 0xfcd34d, size: 3.8, rotationPeriod: 10.7, tilt: 26.7 },
  { name: 'Uranus',  a: 19.19, e: 0.0472, I: 0.77, L: 313.23, w: 170.96,O: 74.23, n: 0.0117, mass: 4.36e-5, color: 0x22d3ee, size: 2.5, rotationPeriod: -17.2, tilt: 97.8 },
  { name: 'Neptune', a: 30.07, e: 0.0086, I: 1.77, L: 304.88, w: 44.97, O: 131.72,n: 0.0060, mass: 5.15e-5, color: 0x3b82f6, size: 2.5, rotationPeriod: 16.1, tilt: 28.3 }
];

const PINN_EVENTS = [
  { year: 1619, label: "Keplerian Resonance", logic: "Harmonic Ratio Discovery" },
  { year: 1687, label: "Principia", logic: "Gravity Laws Established" },
  { year: 1859, label: "Carrington Event", logic: "V-E-J Torque Peak: 0.98 η" },
  { year: 1908, label: "Hale Cycle", logic: "Magnetic Polarity Flip" },
  { year: 1934, label: "Dust Bowl", logic: "Atmospheric Jet Stream Lock" },
  { year: 2026, label: "Cycle 25 Peak", logic: "Constructive Interference" }
];

// --- Procedural Texture Generators ---

const createPlanetTexture = (name: string, colorHex: number) => {
    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height; 
    const ctx = canvas.getContext('2d');
    if(!ctx) return new THREE.Texture();
    
    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    const baseColor = new THREE.Color(colorHex);

    // Default fill
    ctx.fillStyle = '#' + baseColor.getHexString();
    ctx.fillRect(0,0,width,height);

    if (name === 'Mercury') {
        // Cratered, rocky, greyish
        ctx.fillStyle = '#999999';
        ctx.fillRect(0,0,width,height);
        
        // Noise pass
        for(let i=0; i<10000; i++) {
             ctx.fillStyle = Math.random() > 0.5 ? '#777' : '#aaa';
             ctx.fillRect(random(0,width), random(0,height), 2, 2);
        }
        // Craters
        for(let i=0; i<150; i++) {
            const x = random(0,width);
            const y = random(0,height);
            const r = random(2, 12);
            ctx.beginPath();
            ctx.arc(x,y,r,0,Math.PI*2);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    } else if (name === 'Venus') {
        // Thick atmosphere, sulfuric yellow
        const grd = ctx.createLinearGradient(0, 0, 0, height);
        grd.addColorStop(0, '#e8dcb5');
        grd.addColorStop(0.5, '#d6b865');
        grd.addColorStop(1, '#e8dcb5');
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,width,height);
        
        // Atmospheric bands/swirls (blur)
        ctx.filter = 'blur(20px)';
        ctx.fillStyle = 'rgba(160, 120, 40, 0.2)';
        for(let i=0; i<20; i++) {
            ctx.beginPath();
            const y = random(0, height);
            const h = random(50, 150);
            ctx.ellipse(width/2, y, width, h, 0, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.filter = 'none';
    } else if (name === 'Earth') {
        // Ocean
        ctx.fillStyle = '#103060';
        ctx.fillRect(0,0,width,height);
        
        // Continents (Green/Brown noise blobs)
        ctx.fillStyle = '#3a6a3a';
        for(let i=0; i<40; i++) {
             const x = random(0,width);
             const y = random(height*0.1, height*0.9);
             const r = random(30, 100);
             ctx.beginPath();
             ctx.arc(x,y,r,0,Math.PI*2);
             ctx.fill();
             
             // Variation inside continent
             ctx.fillStyle = '#4a7a4a';
             ctx.beginPath();
             ctx.arc(x+10,y+10,r*0.5,0,Math.PI*2);
             ctx.fill();
             ctx.fillStyle = '#3a6a3a'; // Reset
        }
        
        // Clouds
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        for(let i=0; i<400; i++) {
             const x = random(0,width);
             const y = random(0,height);
             const w = random(20, 80);
             const h = random(5, 15);
             ctx.fillRect(x,y,w,h);
        }
    } else if (name === 'Mars') {
        // Red planet
        ctx.fillStyle = '#c1440e';
        ctx.fillRect(0,0,width,height);
        
        // Darker regions
        ctx.fillStyle = 'rgba(60, 20, 0, 0.2)';
        for(let i=0; i<50; i++) {
            const x = random(0,width);
            const y = random(0,height);
            const r = random(20, 80);
            ctx.beginPath();
            ctx.arc(x,y,r,0,Math.PI*2);
            ctx.fill();
        }
        
        // Polar Ice Caps
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, 15);
        ctx.fillRect(0, height-15, width, 15);
        
    } else if (['Jupiter', 'Saturn', 'Uranus', 'Neptune'].includes(name)) {
        // Gas giants
        const bands = name === 'Jupiter' ? 24 : (name === 'Saturn' ? 30 : 12);
        
        for(let i=0; i<bands; i++) {
            const y = (i/bands) * height;
            const h = (1/bands) * height;
            
            // Band color variation
            const hsl = { h: 0, s: 0, l: 0 };
            baseColor.getHSL(hsl);
            
            // Perturb lightness and saturation
            const lVar = Math.cos(i * 0.5) * 0.1 + (Math.random() * 0.05);
            const sVar = (Math.random() * 0.1) - 0.05;
            
            const bandColor = new THREE.Color().setHSL(hsl.h, Math.max(0, Math.min(1, hsl.s + sVar)), Math.max(0, Math.min(1, hsl.l + lVar)));
            
            ctx.fillStyle = '#' + bandColor.getHexString();
            ctx.fillRect(0, y, width, h);
            
            // Turbulence
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            for(let j=0; j<30; j++) {
                ctx.fillRect(random(0,width), y + random(0,h), random(20,60), 1);
            }
        }
        
        if (name === 'Jupiter') {
            // Great Red Spot
            ctx.fillStyle = '#b05040';
            ctx.beginPath();
            ctx.ellipse(width * 0.6, height * 0.65, 70, 35, 0, 0, Math.PI*2);
            ctx.fill();
        }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

// Generate a "Caustic" water/plasma texture for global field
const createCausticPlasmaTexture = () => {
    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    if(!ctx) return new THREE.Texture();
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,size,size);
    
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 1;
    
    for(let i=0; i<40; i++) {
        const amplitude = Math.random() * 60 + 20;
        const period = Math.random() * 0.05 + 0.01;
        const phase = Math.random() * Math.PI * 2;
        const yBase = Math.random() * size;
        
        const gradient = ctx.createLinearGradient(0, 0, size, 0);
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0)');
        gradient.addColorStop(0.5, `rgba(212, 175, 55, ${Math.random() * 0.1})`);
        gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        
        for(let x=0; x<=size; x+=10) {
            const y = yBase + Math.sin(x * period + phase) * amplitude;
            if(x===0) ctx.moveTo(x,y);
            else ctx.lineTo(x,y);
        }
        ctx.stroke();
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
}

// Generate Deep Space Nebula/Starfield Texture
const createNebulaTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if(!ctx) return new THREE.Texture();
    
    // Dark deep space fill
    ctx.fillStyle = '#020408'; 
    ctx.fillRect(0,0,1024,1024);

    // Subtle colored clouds
    const colors = [
        { c: 'rgba(20, 25, 50, 0.4)',  scale: 1.0 }, // Deep Blue base
        { c: 'rgba(50, 30, 60, 0.2)',  scale: 0.8 }, // Purple hints
        { c: 'rgba(10, 40, 50, 0.2)',  scale: 0.6 }, // Teal/Green hints (faint)
        { c: 'rgba(40, 20, 20, 0.15)', scale: 0.7 }  // Red hints (faint)
    ];

    colors.forEach(layer => {
        for(let i=0; i<15; i++) {
             const x = Math.random() * 1024;
             const y = Math.random() * 1024;
             const r = (Math.random() * 300 + 100) * layer.scale;
             
             const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
             grd.addColorStop(0, layer.c);
             grd.addColorStop(1, 'rgba(0,0,0,0)');
             
             ctx.fillStyle = grd;
             ctx.globalCompositeOperation = 'screen';
             ctx.beginPath();
             ctx.arc(x,y,r,0,Math.PI*2);
             ctx.fill();
        }
    });

    // Distant stars baked into texture (for density)
    ctx.fillStyle = '#FFF';
    ctx.globalCompositeOperation = 'source-over';
    for(let i=0; i<800; i++) {
        const alpha = Math.random();
        ctx.globalAlpha = alpha * alpha * alpha * 0.8; // Bias towards faint
        const x = Math.random() * 1024;
        const y = Math.random() * 1024;
        ctx.fillRect(x, y, 1, 1);
    }
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

// --- Orbital Math Engine ---
function solveKepler(M: number, e: number): number {
  let E = M;
  let delta = 1.0;
  let iter = 0;
  while (Math.abs(delta) > 1e-6 && iter < 20) {
    delta = E - e * Math.sin(E) - M;
    E = E - delta / (1 - e * Math.cos(E));
    iter++;
  }
  return E;
}

function getPlanetPositionHeliocentric(planet: OrbitalElements, year: number): { x: number, y: number } {
  const d = (year - 2000.0) * 365.25;
  const a = planet.a;
  const e = planet.e;
  const L_deg = (planet.L + planet.n * d) % 360; 
  const w = (planet.w) * D2R; 
  const M_deg = (L_deg - planet.w); 
  const M = M_deg * D2R;

  const E = solveKepler(M, e);

  // Orbital plane
  const x_orb = a * (Math.cos(E) - e);
  const y_orb = a * Math.sqrt(1 - e * e) * Math.sin(E);

  // Ecliptic rotation
  const x_ecl = x_orb * Math.cos(w) - y_orb * Math.sin(w);
  const y_ecl = x_orb * Math.sin(w) + y_orb * Math.cos(w);

  return { x: x_ecl, y: y_ecl };
}

function getSunBarycentricOffset(year: number): { x: number, y: number } {
  let sumX = 0;
  let sumY = 0;
  PLANETS_DATA.forEach(p => {
    const pos = getPlanetPositionHeliocentric(p, year);
    sumX += pos.x * p.mass;
    sumY += pos.y * p.mass;
  });
  const EXAGGERATION = 200.0; 
  return { x: -sumX * EXAGGERATION, y: -sumY * EXAGGERATION };
}

function calculateTorqueIndex(year: number): number {
    const vej = Math.sin(year * (2 * Math.PI / 11.07));
    const js = Math.sin(year * (2 * Math.PI / 19.86));
    return ((vej + js) / 2 + 1) / 2;
}

const SolarSystemViz: React.FC<SolarSystemVizProps> = ({ year, onYearChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetYearRef = useRef(year);
  const onYearChangeRef = useRef(onYearChange);
  const [controlMode, setControlMode] = useState<'zoom' | 'time'>('zoom');
  
  const [timeStepIndex, setTimeStepIndex] = useState(4);
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [pinnData, setPinnData] = useState<{label: string, logic: string} | null>(null);
  const [torqueIndex, setTorqueIndex] = useState(0);
  const [zScale, setZScale] = useState(6.0);
  const zScaleRef = useRef(6.0);
  const [orbitOpacity, setOrbitOpacity] = useState(0.15);
  const orbitOpacityRef = useRef(0.15);
  const [visibleOrbits, setVisibleOrbits] = useState<Record<string, boolean>>({
      'Mercury': true, 'Venus': true, 'Earth': true, 'Mars': true,
      'Jupiter': true, 'Saturn': true, 'Uranus': true, 'Neptune': true
  });
  const visibleOrbitsRef = useRef(visibleOrbits);
  
  const planetsRef = useRef<THREE.Group[]>([]);
  const fieldsRef = useRef<THREE.Group[]>([]);
  const plasmaFieldRef = useRef<THREE.Group>(null);
  const bgGroupRef = useRef<THREE.Group>(null);
  const timeAxisGroupRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<OrbitControls>(null);
  const timeStepRef = useRef(TIME_STEPS[4]);
  const orbitLinesRef = useRef<THREE.Line[]>([]);

  useEffect(() => {
    targetYearRef.current = year;
    onYearChangeRef.current = onYearChange;
  }, [year, onYearChange]);

  useEffect(() => {
    timeStepRef.current = TIME_STEPS[timeStepIndex];
  }, [timeStepIndex]);

  useEffect(() => {
    zScaleRef.current = zScale;
    if (timeAxisGroupRef.current) {
        timeAxisGroupRef.current.scale.z = zScale;
    }
  }, [zScale]);

  useEffect(() => {
      orbitOpacityRef.current = orbitOpacity;
      orbitLinesRef.current.forEach(line => {
          if (line.material instanceof THREE.LineBasicMaterial) {
              line.material.opacity = orbitOpacity;
              line.visible = visibleOrbits[line.userData.planetName];
          }
      });
  }, [orbitOpacity, visibleOrbits]);

  useEffect(() => {
    visibleOrbitsRef.current = visibleOrbits;
  }, [visibleOrbits]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f1419, 0.0006); 

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 30000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 20;
    controls.maxDistance = 2500; 
    // @ts-ignore
    controlsRef.current = controls;

    // --- Background (Skybox) ---
    const bgGroup = new THREE.Group();
    scene.add(bgGroup);
    // @ts-ignore
    bgGroupRef.current = bgGroup;

    const bgGeo = new THREE.SphereGeometry(8000, 64, 64);
    const bgMat = new THREE.MeshBasicMaterial({
        map: createNebulaTexture(),
        side: THREE.BackSide,
        fog: false, // Critical: Ignore fog
        depthWrite: false
    });
    const bgMesh = new THREE.Mesh(bgGeo, bgMat);
    bgGroup.add(bgMesh);

    // Bright Stars Particle System
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const pArray = new Float32Array(starCount * 3);
    
    for(let i=0; i<starCount; i++) {
        const r = 4000 + Math.random() * 3000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        pArray[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pArray[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pArray[i*3+2] = r * Math.cos(phi);
    }
    
    starsGeo.setAttribute('position', new THREE.BufferAttribute(pArray, 3));
    
    const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 15,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
        fog: false,
        blending: THREE.AdditiveBlending
    });
    const starSystem = new THREE.Points(starsGeo, starMat);
    bgGroup.add(starSystem);

    // --- Lighting ---
    const sunLight = new THREE.PointLight(0xffffff, 3.0, 6000); 
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);
    
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    // --- Time Axis Group (Scalable Z) ---
    const timeAxisGroup = new THREE.Group();
    timeAxisGroup.scale.z = zScaleRef.current;
    scene.add(timeAxisGroup);
    // @ts-ignore
    timeAxisGroupRef.current = timeAxisGroup;

    // --- Sun Spine ---
    const sunPoints: THREE.Vector3[] = [];
    const sunSteps = 10000;
    for (let i = 0; i <= sunSteps; i++) {
        const y = MIN_YEAR + (i / sunSteps) * (MAX_YEAR - MIN_YEAR);
        const sunPos = getSunBarycentricOffset(y);
        const z = (y - MIN_YEAR) * BASE_VISUAL_SCALE;
        sunPoints.push(new THREE.Vector3(sunPos.x, sunPos.y, z));
    }
    const spineCurve = new THREE.CatmullRomCurve3(sunPoints);
    const spineGeo = new THREE.BufferGeometry().setFromPoints(spineCurve.getPoints(3000));
    const spineMat = new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.5, linewidth: 1 });
    const spineLine = new THREE.Line(spineGeo, spineMat);
    timeAxisGroup.add(spineLine);

    // --- Planetary Trails ---
    orbitLinesRef.current = [];
    PLANETS_DATA.forEach(planet => {
      const points: THREE.Vector3[] = [];
      const stepSize = (MAX_YEAR - MIN_YEAR) / TRAIL_STEPS;
      
      for (let i = 0; i <= TRAIL_STEPS; i++) {
        const y = MIN_YEAR + i * stepSize;
        const helio = getPlanetPositionHeliocentric(planet, y);
        const sunOffset = getSunBarycentricOffset(y);
        
        const angle = Math.atan2(helio.y, helio.x);
        const realDist = Math.sqrt(helio.x*helio.x + helio.y*helio.y);
        const visualRadius = Math.pow(realDist, 0.45) * ORBIT_SCALE;
        
        const z = (y - MIN_YEAR) * BASE_VISUAL_SCALE;
        
        points.push(new THREE.Vector3(
            sunOffset.x + Math.cos(angle) * visualRadius, 
            sunOffset.y + Math.sin(angle) * visualRadius, 
            z
        ));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const opacity = orbitOpacityRef.current;
      const material = new THREE.LineBasicMaterial({ 
          color: planet.color, 
          transparent: true, 
          opacity: opacity,
          depthWrite: true
      });
      const line = new THREE.Line(geometry, material);
      line.userData = { planetName: planet.name };
      line.visible = visibleOrbitsRef.current[planet.name];
      orbitLinesRef.current.push(line);
      timeAxisGroup.add(line);
    });

    const cursorGroup = new THREE.Group();
    scene.add(cursorGroup);

    // Sun Mesh (Shader Based)
    const sunGeo = new THREE.SphereGeometry(4, 64, 64);
    
    // Custom Shader Material for Burgamot Sun
    const sunMat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            torque: { value: 0.0 },
            coreColor: { value: new THREE.Color(0x332200) }, // Dark Golden Heart
            surfaceColor: { value: new THREE.Color(0x550011) }, // Deep Burgamot
            glowColor: { value: new THREE.Color(0xffcc00) } // Bright Gold
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float torque;
            uniform vec3 coreColor;
            uniform vec3 surfaceColor;
            uniform vec3 glowColor;
            varying vec2 vUv;
            varying vec3 vNormal;

            // Simplex noise function (simplified)
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            float snoise(vec3 v) {
                const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy));
                vec3 x0 = v - i + dot(i, C.xxx);
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy;
                vec3 x3 = x0 - D.yyy;
                i = mod289(i);
                vec4 p = permute( permute( permute( 
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                float n_ = 0.142857142857;
                vec3  ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ );
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
            }

            void main() {
                // Dynamic noise pattern
                float noise = snoise(vec3(vNormal * 2.5 + time * 0.15));
                
                // Layer mixing: Core (Dark Gold) -> Surface (Burgamot) -> Flare (Bright Gold)
                vec3 baseMix = mix(coreColor, surfaceColor, smoothstep(-0.3, 0.2, noise));
                
                // Add torque influence to flare intensity
                float flareThreshold = 0.5 - (torque * 0.2); 
                vec3 finalColor = mix(baseMix, glowColor, smoothstep(flareThreshold, flareThreshold + 0.2, noise));
                
                // Fresnel effect for edge glow
                vec3 viewDir = normalize(cameraPosition - vec3(0.0));
                float fresnel = pow(1.0 - dot(vNormal, vec3(0,0,1)), 2.5); 
                finalColor += glowColor * fresnel * (0.4 + torque * 0.3);

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        transparent: true
    });
    
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    
    // Sun Glow Sprite (Enhanced)
    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ 
        map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png'), 
        color: 0xff4400, 
        transparent: true, 
        blending: THREE.AdditiveBlending, 
        opacity: 0.8 
    }));
    glowSprite.scale.set(70, 70, 1);
    sunMesh.add(glowSprite);

    // Corona Mesh (Dynamic Shader)
    const coronaGeo = new THREE.SphereGeometry(4.5, 64, 64);
    const coronaMat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            torque: { value: 0.0 },
            baseColor: { value: new THREE.Color(0xffaa00) }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float torque;
            uniform vec3 baseColor;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float dotNV = 1.0 - max(0.0, dot(normal, viewDir));
                float fresnel = pow(dotNV, 2.0);
                
                float pulse = sin(time * 3.0) * 0.1 + 0.9;
                float alpha = fresnel * (0.3 + torque * 0.5) * pulse;
                
                gl_FragColor = vec4(baseColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        depthWrite: false
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    sunMesh.add(coronaMesh);

    // Magnetic Field Lines (Swirling Shader)
    const magGeo = new THREE.SphereGeometry(4.1, 64, 64);
    const magMat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            torque: { value: 0.0 },
            color: { value: new THREE.Color(0xffcc00) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform float torque;
            uniform vec3 color;
            varying vec2 vUv;
            
            // Simplex noise for organic swirl
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                // Swirling field lines from poles
                float noise = snoise(vec2(vUv.x * 10.0, vUv.y * 5.0 + time * 0.5));
                float flow = sin(vUv.x * 60.0 + time * 2.0 + noise * 5.0 * torque);
                
                // Constrain to poles
                float poleMask = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
                float lines = smoothstep(0.95, 1.0, flow);
                
                gl_FragColor = vec4(color, lines * poleMask * 0.4 * (0.5 + torque));
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const magMesh = new THREE.Mesh(magGeo, magMat);
    sunMesh.add(magMesh);

    cursorGroup.add(sunMesh);

    // --- Global Sun-Plasma Field ---
    const plasmaGroup = new THREE.Group();
    const plasmaTex = createCausticPlasmaTexture();
    const layerSizes = [100, 200, 350, 550];
    layerSizes.forEach((size, i) => {
        const mat = new THREE.MeshBasicMaterial({
            color: 0xd4af37, // Solar Gold
            map: plasmaTex,
            transparent: true,
            opacity: 0.01 + (i * 0.005), 
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false, 
        });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(size, 64, 64), mat);
        mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
        mesh.userData = { 
            rotSpeed: 0.0002 * (i % 2 === 0 ? 1 : -1),
            pulseSpeed: 0.0005 + (i * 0.0002),
            baseScale: 1.0
        };
        plasmaGroup.add(mesh);
    });
    // @ts-ignore
    plasmaFieldRef.current = plasmaGroup;
    cursorGroup.add(plasmaGroup);

    // --- Planets ---
    planetsRef.current = [];
    fieldsRef.current = [];

    PLANETS_DATA.forEach(p => {
      const pGroup = new THREE.Group();

      // 1. Tilt Group (Obliquity)
      const tiltGroup = new THREE.Group();
      // Apply axial tilt (rotate around Z axis)
      tiltGroup.rotation.z = p.tilt * D2R;
      pGroup.add(tiltGroup);

      // 2. Planet Mesh (PBR + Dynamic Texture)
      const texture = createPlanetTexture(p.name, p.color);
      const mat = new THREE.MeshPhongMaterial({ 
          map: texture,
          color: 0xffffff,
          specular: 0x333333,
          shininess: 10,
          emissive: p.color,
          emissiveIntensity: 0.2
      });
      const geo = new THREE.SphereGeometry(p.size, 64, 64);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // Rotation logic handled in animate loop via time
      tiltGroup.add(mesh);

      // 3. Resonant Field
      const fieldGroup = new THREE.Group();
      for(let f=0; f<2; f++) { 
          const fieldGeo = new THREE.SphereGeometry(p.size * (4.0 + f * 3.0), 32, 32);
          const fieldMat = new THREE.MeshBasicMaterial({
              color: p.color,
              transparent: true,
              opacity: 0.02,
              blending: THREE.AdditiveBlending,
              side: THREE.DoubleSide,
              depthWrite: false
          });
          const fieldMesh = new THREE.Mesh(fieldGeo, fieldMat);
          fieldMesh.userData = { 
              pulseOffset: f, 
              baseScale: 4.0 + f * 3.0,
              freq: (p.n * 0.3) + 0.2 
          };
          fieldGroup.add(fieldMesh);
      }
      pGroup.add(fieldGroup);
      fieldsRef.current.push(fieldGroup);

      // 4. Orbital Spin Axis (Static within Tilt Group)
      const axisGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, p.size * 2.2, 0),
          new THREE.Vector3(0, -p.size * 2.2, 0)
      ]);
      const axisLine = new THREE.Line(axisGeo, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true }));
      tiltGroup.add(axisLine);

      // North Pole Indicator
      const poleGeo = new THREE.ConeGeometry(p.size * 0.1, p.size * 0.3, 8);
      const poleMat = new THREE.MeshBasicMaterial({ color: 0xff3333 });
      const poleMesh = new THREE.Mesh(poleGeo, poleMat);
      poleMesh.position.y = p.size * 2.2;
      tiltGroup.add(poleMesh);

      // Equator Line (except Saturn which has rings)
      if (p.name !== 'Saturn') {
          const eqGeo = new THREE.BufferGeometry().setFromPoints(
              new THREE.EllipseCurve(0, 0, p.size * 1.2, p.size * 1.2, 0, 2 * Math.PI, false, 0).getPoints(64)
          );
          const eqLine = new THREE.Line(eqGeo, new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.2, transparent: true }));
          eqLine.rotation.x = Math.PI / 2;
          tiltGroup.add(eqLine);
      }
      
      // 5. Instantaneous Orbit Ring (Visual aid, not physical)
      const orbitShape = new THREE.EllipseCurve(0, 0, 10, 10, 0, 2 * Math.PI, false, 0); 
      const orbitPts = orbitShape.getPoints(128);
      const orbitLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(orbitPts),
          new THREE.LineBasicMaterial({ 
              color: p.color, 
              transparent: true, 
              opacity: p.name === 'Earth' ? 0.8 : 0.5,
              linewidth: 2
          }) 
      );
      orbitLine.rotation.x = Math.PI / 2;
      orbitLine.userData = { isOrbit: true, planet: p };
      cursorGroup.add(orbitLine);

      // Earth-Moon
      if (p.name === 'Earth') {
         const moonGeo = new THREE.SphereGeometry(p.size * 0.27, 32, 32);
         const moonMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, emissive: 0x222222, emissiveIntensity: 0.1 });
         const moon = new THREE.Mesh(moonGeo, moonMat);
         moon.castShadow = true;
         moon.receiveShadow = true;
         // @ts-ignore
         moonRef.current = moon;
         pGroup.add(moon);
         
         const mOrbit = new THREE.Line(
             new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0,0,6,6,0,2*Math.PI,false,0).getPoints(64)),
             new THREE.LineBasicMaterial({ color: 0x555555, opacity: 0.5, transparent: true })
         );
         mOrbit.rotation.x = Math.PI/2;
         pGroup.add(mOrbit);
      }
      
      // Saturn Ring
      if (p.name === 'Saturn') {
         const rGeo = new THREE.RingGeometry(p.size * 1.4, p.size * 2.5, 64);
         const rMat = new THREE.MeshStandardMaterial({ color: 0xcfb53b, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
         const ring = new THREE.Mesh(rGeo, rMat);
         ring.rotation.x = Math.PI / 2; // Rings align with equator
         ring.castShadow = true;
         ring.receiveShadow = true;
         // Add to tiltGroup so it tilts with planet
         tiltGroup.add(ring);
      }

      cursorGroup.add(pGroup);
      planetsRef.current.push(pGroup);
    });

    // --- Markers ---
    const markerGroup = new THREE.Group();
    timeAxisGroup.add(markerGroup);
    const fontLoader = new FontLoader();
    fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
      PINN_EVENTS.forEach(ev => {
        const z = (ev.year - MIN_YEAR) * BASE_VISUAL_SCALE;
        const sunPos = getSunBarycentricOffset(ev.year);
        
        const textGeo = new TextGeometry(`${ev.year}`, { font, size: 4, height: 0.2 });
        textGeo.center();
        const textMesh = new THREE.Mesh(textGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        
        textMesh.position.set(sunPos.x + 50, sunPos.y + 30, z);
        textMesh.userData = { isMarker: true };
        
        markerGroup.add(textMesh);
        
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(sunPos.x, sunPos.y, z),
            new THREE.Vector3(sunPos.x + 48, sunPos.y + 30, z)
        ]);
        markerGroup.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })));
      });
    });

    // --- Loop ---
    let renderYear = targetYearRef.current;
    let firstFrame = true;
    const prevPos = new THREE.Vector3();
    let frame = 0;

    const animate = () => {
      requestAnimationFrame(animate);
      frame++;

      // Rotate Background
      if(bgGroupRef.current) {
         bgGroupRef.current.rotation.y += 0.00008;
      }

      // Momentum Scroll Logic
      const diff = targetYearRef.current - renderYear;
      if (Math.abs(diff) > 0.001) renderYear += diff * 0.1;
      else renderYear = targetYearRef.current;

      // Positions
      const sunOffset = getSunBarycentricOffset(renderYear);
      const z = (renderYear - MIN_YEAR) * BASE_VISUAL_SCALE * zScaleRef.current;
      const sunVec = new THREE.Vector3(sunOffset.x, sunOffset.y, z);

      // Sun & Light
      sunMesh.position.copy(sunVec);
      sunLight.position.copy(sunVec);

      // Torque Index
      const tIdx = calculateTorqueIndex(renderYear);
      setTorqueIndex(tIdx);
      
      // Update Sun Shader Uniforms
      if (sunMesh.material instanceof THREE.ShaderMaterial) {
          sunMesh.material.uniforms.time.value = frame * 0.05;
          sunMesh.material.uniforms.torque.value = tIdx;
      }
      
      // Update Glow Sprite
      const glow = sunMesh.children[0] as THREE.Sprite;
      if (glow) {
          const pulse = Math.sin(frame * 0.05) * 0.1;
          const baseScale = 70 + (tIdx * 20);
          glow.scale.set(baseScale + pulse, baseScale + pulse, 1.0);
          glow.material.opacity = 0.6 + (tIdx * 0.3);
          glow.material.color.setHSL(0.05 + (tIdx * 0.05), 1.0, 0.5); // Red -> Orange shift
      }

      // Update Corona Shader
      const corona = sunMesh.children[1] as THREE.Mesh;
      if (corona && corona.material instanceof THREE.ShaderMaterial) {
          corona.material.uniforms.time.value = frame * 0.05;
          corona.material.uniforms.torque.value = tIdx;
      }

      // Update Magnetic Field Shader
      const magField = sunMesh.children[2] as THREE.Mesh;
      if (magField && magField.material instanceof THREE.ShaderMaterial) {
          magField.material.uniforms.time.value = frame * 0.02;
          magField.material.uniforms.torque.value = tIdx;
      }

      // Update Global Plasma Field
      if (plasmaFieldRef.current) {
          plasmaFieldRef.current.position.copy(sunVec);
          plasmaFieldRef.current.children.forEach((mesh, i) => {
              const u = mesh.userData;
              mesh.rotation.y += u.rotSpeed;
              mesh.rotation.z += u.rotSpeed * 0.5;
              const pulse = Math.sin(frame * u.pulseSpeed) * 0.02;
              const torqueMod = (tIdx * 0.05 * (i+1));
              const scale = u.baseScale + pulse + torqueMod;
              mesh.scale.set(scale, scale, scale);
          });
      }

      // Planets & Fields Animation
      PLANETS_DATA.forEach((p, idx) => {
        const helio = getPlanetPositionHeliocentric(p, renderYear);
        const angle = Math.atan2(helio.y, helio.x);
        const realDist = Math.sqrt(helio.x*helio.x + helio.y*helio.y);
        const visualRadius = Math.pow(realDist, 0.45) * ORBIT_SCALE;

        const px = sunVec.x + Math.cos(angle) * visualRadius;
        const py = sunVec.y + Math.sin(angle) * visualRadius;
        
        const pGroup = planetsRef.current[idx];
        if (pGroup) {
            pGroup.position.set(px, py, z);
            
            // TIME-LOCKED SPIN:
            // Calculate total hours since J2000 epoch approx
            // Year 2000 = 0.
            const totalHours = (renderYear - 2000) * 365.25 * 24;
            
            // The tiltGroup is child 0.
            const tiltGroup = pGroup.children[0] as THREE.Group;
            if(tiltGroup) {
                // The planet mesh is child 0 of tiltGroup (axisLine is child 1, rings child 2)
                const planetMesh = tiltGroup.children[0] as THREE.Mesh;
                if(planetMesh) {
                    const rotationAngle = (totalHours / p.rotationPeriod) * Math.PI * 2;
                    planetMesh.rotation.y = rotationAngle;
                }
            }

            // Animate Fluid Fields (Ripples)
            const fieldGroup = fieldsRef.current[idx];
            if(fieldGroup) {
                fieldGroup.children.forEach((child, fIdx) => {
                   const field = child as THREE.Mesh;
                   const u = field.userData;
                   const time = frame * 0.015;
                   const sineWave = Math.sin(time * u.freq + fIdx);
                   const scalePulse = sineWave * 0.15; 
                   const currentScale = u.baseScale + scalePulse + (tIdx * 0.02);
                   
                   field.scale.set(currentScale, currentScale, currentScale);
                   
                   const baseOp = 0.01; 
                   const pulseOp = Math.max(0.005, baseOp + (sineWave * 0.005)); 
                   (field.material as THREE.MeshBasicMaterial).opacity = pulseOp;

                   field.rotation.z += 0.001 * (fIdx % 2 === 0 ? 1 : -1);
                   field.rotation.y += 0.001;
                });
            }

            // Earth-Moon
            if (p.name === 'Earth' && moonRef.current) {
                const moonAngle = (renderYear / 0.0748) * Math.PI * 2;
                moonRef.current.position.set(Math.cos(moonAngle) * 6, Math.sin(moonAngle) * 6, 0);
            }
        }

        // Orbit Rings
        cursorGroup.children.forEach(child => {
            if (child.userData.isOrbit && child.userData.planet.name === p.name) {
                child.position.set(sunVec.x, sunVec.y, z);
                child.scale.set(visualRadius / 10, visualRadius / 10, 1);
            }
        });
      });

      // Camera
      if (firstFrame) {
        camera.position.set(sunVec.x + 60, sunVec.y + 40, z - 100);
        controls.target.copy(sunVec);
        firstFrame = false;
      } else {
        const delta = sunVec.clone().sub(prevPos);
        camera.position.add(delta);
        controls.target.add(delta);
      }
      prevPos.copy(sunVec);

      // Markers
      markerGroup.children.forEach(c => {
          if (c.userData.isMarker) c.lookAt(camera.position);
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
        if (!containerRef.current) return;
        camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    // --- Input Logic: Ctrl+Scroll for Time, Scroll for Zoom ---
    const handleWheel = (e: WheelEvent) => {
        // If CTRL is pressed, we navigate time
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            setControlMode('time');
            
            // Use the currently selected time step
            const sensitivity = timeStepRef.current.value; 
            
            // Normalize scroll direction to ensure consistent steps (one notch = one step)
            const direction = Math.sign(e.deltaY);
            
            let next = targetYearRef.current + (direction * sensitivity);
            next = Math.max(MIN_YEAR, Math.min(MAX_YEAR, next));
            
            // Snapping
            for (const ev of PINN_EVENTS) {
                if (Math.abs(next - ev.year) < 0.2) {
                    setPinnData(ev);
                    if (Math.abs(next - ev.year) < 0.05) next = ev.year; 
                    break;
                } else {
                    setPinnData(null);
                }
            }
            if (onYearChangeRef.current) onYearChangeRef.current(next);
        } else {
            // Otherwise, let OrbitControls handle Zoom
            setControlMode('zoom');
        }
    };

    // Detect Key press for UI hint
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Control' || e.key === 'Meta') setControlMode('time');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === 'Control' || e.key === 'Meta') setControlMode('zoom');
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    containerRef.current.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        if (containerRef.current) {
            containerRef.current.removeEventListener('wheel', handleWheel, { capture: true });
            containerRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden bg-black/90 ring-1 ring-white/10 group">
        <div ref={containerRef} className="w-full h-full cursor-col-resize" />
        
        {/* HUD: PINN Logic Card */}
        <div className="absolute top-6 right-6 pointer-events-none flex flex-col items-end gap-3 z-20">
             <div className="bg-black/60 backdrop-blur-md p-3 rounded-lg border border-white/10 w-48">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <Activity size={10} /> Torque Index (η)
                    </span>
                    <span className="text-solar-gold font-mono text-xs font-bold">{torqueIndex.toFixed(2)}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 transition-all duration-100"
                        style={{ width: `${torqueIndex * 100}%` }}
                    />
                </div>
             </div>

             <div className={`
                bg-deep-space/90 backdrop-blur-xl p-4 rounded-xl border border-solar-gold/30 w-64 shadow-2xl transition-all duration-300 transform
                ${pinnData ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
             `}>
                <div className="flex items-start gap-3 mb-2">
                    <div className="bg-solar-gold/20 p-2 rounded-lg text-solar-gold">
                        <Zap size={18} />
                    </div>
                    <div>
                        <div className="text-xs text-solar-gold font-bold uppercase tracking-wider">PINN Reasoning</div>
                        <div className="text-white font-serif font-bold leading-tight">{pinnData?.label}</div>
                    </div>
                </div>
                <div className="text-xs text-gray-300 pl-10 border-l border-white/10">
                    <span className="text-gray-500">Logic:</span> {pinnData?.logic}
                </div>
             </div>
        </div>

        {/* Input Mode Indicator */}
        <div className="absolute top-6 left-6 flex items-start gap-3">
             <div className="flex flex-col gap-2">
                 {/* Mode Status */}
                <div className="flex items-center gap-2 pointer-events-none">
                    <div className={`
                        px-3 py-1.5 rounded-lg border backdrop-blur-md flex items-center gap-2 transition-all
                        ${controlMode === 'time' ? 'bg-solar-gold/20 border-solar-gold text-solar-gold' : 'bg-black/40 border-white/10 text-gray-500'}
                    `}>
                        <Clock size={14} />
                        <span className="text-xs font-bold tracking-wider">TIME</span>
                    </div>
                    <div className={`
                        px-3 py-1.5 rounded-lg border backdrop-blur-md flex items-center gap-2 transition-all
                        ${controlMode === 'zoom' ? 'bg-blue-500/20 border-blue-400 text-blue-400' : 'bg-black/40 border-white/10 text-gray-500'}
                    `}>
                        <Move3d size={14} />
                        <span className="text-xs font-bold tracking-wider">VIEW</span>
                    </div>
                </div>

                {/* Adjustable Time Step Dropdown */}
                <div className="relative z-30 pointer-events-auto">
                    <button 
                        onClick={() => setShowTimeMenu(!showTimeMenu)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-black/60 border border-white/20 rounded-lg text-xs text-white hover:bg-white/10 transition-colors w-full justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Settings2 size={12} className="text-solar-gold" />
                            <span className="text-gray-400">Step:</span> 
                            <span className="font-bold">{TIME_STEPS[timeStepIndex].label}</span>
                        </div>
                        <ChevronDown size={12} className={`transition-transform ${showTimeMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showTimeMenu && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-deep-space/95 border border-white/20 rounded-lg shadow-xl overflow-hidden backdrop-blur-md flex flex-col">
                            {TIME_STEPS.map((step, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setTimeStepIndex(idx);
                                        setShowTimeMenu(false);
                                    }}
                                    className={`
                                        px-3 py-2 text-left text-xs transition-colors flex justify-between
                                        ${timeStepIndex === idx ? 'bg-solar-gold/20 text-solar-gold font-bold' : 'text-gray-300 hover:bg-white/10'}
                                    `}
                                >
                                    <span>{step.label}</span>
                                    <span className="opacity-50 font-mono">{step.short}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col gap-3 pointer-events-none">
            <div className="flex justify-between items-end">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 pointer-events-auto">
                     <div className="text-xs text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Calendar size={12} />
                        Barycentric Epoch
                     </div>
                     <div className="text-2xl font-mono font-bold text-solar-gold">
                        {year.toFixed(2)} <span className="text-sm text-gray-500">CE</span>
                     </div>
                </div>
                <div className="text-xs text-gray-400 flex flex-col items-end gap-1 bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-2 text-white">
                        <span className="bg-white/20 px-1 rounded text-[10px]">CTRL</span> + <span className="bg-white/20 px-1 rounded text-[10px]">SCROLL</span>
                        <span>to change year</span>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-4 items-center bg-black/40 backdrop-blur-sm p-2 rounded-xl border border-white/5 pointer-events-auto transition-opacity duration-300 opacity-90 hover:opacity-100">
                <div className="flex-1">
                    <input 
                        type="range" 
                        min={MIN_YEAR} 
                        max={MAX_YEAR} 
                        step={0.1}
                        value={year}
                        onChange={(e) => onYearChange && onYearChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-solar-gold"
                    />
                </div>
                <div className="w-32 flex flex-col gap-1">
                     <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider">
                        <span>Z-Scale</span>
                        <span>{zScale.toFixed(1)}x</span>
                     </div>
                     <input 
                        type="range" 
                        min={1} 
                        max={20} 
                        step={0.5}
                        value={zScale}
                        onChange={(e) => setZScale(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-400"
                    />
                </div>
                
                {/* Orbit Controls */}
                <div className="flex flex-col gap-1 border-l border-white/10 pl-4">
                    <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-wider w-32">
                        <span>Orbit Opacity</span>
                        <span>{(orbitOpacity * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min={0} 
                        max={1} 
                        step={0.1}
                        value={orbitOpacity}
                        onChange={(e) => setOrbitOpacity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-400 mb-2"
                    />
                    <div className="flex gap-1 flex-wrap w-32">
                        {PLANETS_DATA.map(p => (
                            <button
                                key={p.name}
                                onClick={() => setVisibleOrbits(prev => ({ ...prev, [p.name]: !prev[p.name] }))}
                                className={`w-3 h-3 rounded-full transition-all ${visibleOrbits[p.name] ? 'opacity-100 ring-1 ring-white' : 'opacity-30 grayscale'}`}
                                style={{ backgroundColor: '#' + new THREE.Color(p.color).getHexString() }}
                                title={`Toggle ${p.name} Orbit`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default SolarSystemViz;