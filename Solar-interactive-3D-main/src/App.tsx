import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { MousePointer2, Sparkles, Info, Zap, Hand, Target, RotateCw, Move, Camera as CameraIcon, VideoOff, Sun, Globe, Orbit } from 'lucide-react';
import * as mpHands from '@mediapipe/hands';
import * as mpCamera from '@mediapipe/camera_utils';

const Hands = (mpHands as any).Hands || (mpHands as any).default.Hands;
const Camera = (mpCamera as any).Camera || (mpCamera as any).default.Camera;
type Results = any;

const PLANET_DATA = [
  { name: 'Mercury', color: 0x888888, size: 6, orbitRadius: 150, speed: 0.02 },
  { name: 'Venus', color: 0xe3bb76, size: 12, orbitRadius: 220, speed: 0.015 },
  { name: 'Earth', color: 0x2271b3, size: 13, orbitRadius: 300, speed: 0.01 },
  { name: 'Mars', color: 0xe27b58, size: 10, orbitRadius: 380, speed: 0.008 },
  { name: 'Jupiter', color: 0xd39c7e, size: 30, orbitRadius: 520, speed: 0.005 },
  { name: 'Saturn', color: 0xc5ab6e, size: 26, orbitRadius: 680, speed: 0.003, hasRings: true },
  { name: 'Uranus', color: 0xb2d1d1, size: 18, orbitRadius: 820, speed: 0.002 },
  { name: 'Neptune', color: 0x3f54ba, size: 17, orbitRadius: 950, speed: 0.0015 },
];

type InteractionMode = 'grab' | 'repel' | 'vortex';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('grab');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [grabbedPlanet, setGrabbedPlanet] = useState<string | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoverLock, setHoverLock] = useState(0);

  
  const mouseRef = useRef(new THREE.Vector2(-9999, -9999));
  const interactionModeRef = useRef<InteractionMode>(interactionMode);
  const isMouseDownRef = useRef(false);
  const lastMousePosRef = useRef(new THREE.Vector2(-9999, -9999));
  const grabbedPlanetRef = useRef<string | null>(null);
  const hoveredPlanetRef = useRef<string | null>(null);
  const grabOffsetRef = useRef(new THREE.Vector3());
  const hoverLockRef = useRef(0);

  useEffect(() => {
    interactionModeRef.current = interactionMode;
  }, [interactionMode]);

  useEffect(() => {
    isMouseDownRef.current = isMouseDown;
  }, [isMouseDown]);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: Results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        setHandDetected(true);
        const landmarks = results.multiHandLandmarks[0];
        
        
        const indexTip = landmarks[8];
        
        const thumbTip = landmarks[4];

        
        const x = (1 - indexTip.x) * window.innerWidth;
        const y = indexTip.y * window.innerHeight;

        
        lastMousePosRef.current.copy(mouseRef.current);
        mouseRef.current.x = (x / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(y / window.innerHeight) * 2 + 1;

        
        const dx = indexTip.x - thumbTip.x;
        const dy = indexTip.y - thumbTip.y;
        const dz = indexTip.z - thumbTip.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const pinchThreshold = isMouseDownRef.current ? 0.1 : 0.07; 
        const isPinching = distance < pinchThreshold;
        if (isPinching !== isMouseDownRef.current) {
          setIsMouseDown(isPinching);
        }
      } else {
        setHandDetected(false);
        
        mouseRef.current.set(-9999, -9999);
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current! });
      },
      width: 640,
      height: 480,
    });

    camera.start()
      .then(() => setIsCameraActive(true))
.catch((err: unknown) => {
        console.error("Camera failed:", err);
        setIsCameraActive(false);
      });

    return () => {
      camera.stop();
      hands.close();
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 800, 1200);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    
    const sunGeo = new THREE.SphereGeometry(60, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc33 });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sun);

    
    const sunGlowGeo = new THREE.SphereGeometry(75, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({ 
      color: 0xffaa00, 
      transparent: true, 
      opacity: 0.3 
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    scene.add(sunGlow);

    
    const coronaCanvas = document.createElement('canvas');
    coronaCanvas.width = 128;
    coronaCanvas.height = 128;
    const ctx = coronaCanvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 200, 50, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 150, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    const coronaTexture = new THREE.CanvasTexture(coronaCanvas);
    const coronaMat = new THREE.SpriteMaterial({ 
      map: coronaTexture, 
      transparent: true, 
      blending: THREE.AdditiveBlending 
    });
    const corona = new THREE.Sprite(coronaMat);
    corona.scale.set(300, 300, 1);
    scene.add(corona);

    
    const planets: { 
      mesh: THREE.Mesh, 
      data: typeof PLANET_DATA[0], 
      angle: number, 
      currentRadius: number,
      orbitRing: THREE.Mesh,
      rings?: THREE.Mesh,
      trail: THREE.Points
    }[] = [];
    
    PLANET_DATA.forEach((data) => {
      const planetGeo = new THREE.SphereGeometry(data.size, 32, 32);
      const planetMat = new THREE.MeshStandardMaterial({ 
        color: data.color,
        roughness: 0.7,
        metalness: 0.2,
        emissive: data.color,
        emissiveIntensity: 0.1
      });
      const mesh = new THREE.Mesh(planetGeo, planetMat);
      
      
      const orbitGeo = new THREE.RingGeometry(data.orbitRadius - 1, data.orbitRadius + 1, 128);
      const orbitMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.1,
        side: THREE.DoubleSide 
      });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2;
      scene.add(orbitRing);

      
      let rings;
      if (data.hasRings) {
        const ringGeo = new THREE.RingGeometry(data.size * 1.4, data.size * 2.2, 64);
        const ringMat = new THREE.MeshStandardMaterial({ 
          color: data.color, 
          transparent: true, 
          opacity: 0.6, 
          side: THREE.DoubleSide 
        });
        rings = new THREE.Mesh(ringGeo, ringMat);
        rings.rotation.x = Math.PI / 2.5;
        mesh.add(rings);
      }

      
      const trailGeo = new THREE.BufferGeometry();
      const trailCount = 50;
      const trailPositions = new Float32Array(trailCount * 3);
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      const trailMat = new THREE.PointsMaterial({ 
        color: data.color, 
        size: 2, 
        transparent: true, 
        opacity: 0.4 
      });
      const trail = new THREE.Points(trailGeo, trailMat);
      scene.add(trail);

      planets.push({ 
        mesh, 
        data, 
        angle: Math.random() * Math.PI * 2,
        currentRadius: data.orbitRadius,
        orbitRing,
        rings,
        trail
      });
      scene.add(mesh);
    });

    
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1000000, 2000);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 4000;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 4000;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 4000;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    
    const targetBracketGeo = new THREE.RingGeometry(40, 42, 4, 1, 0, Math.PI * 2);
    const targetBracketMat = new THREE.MeshBasicMaterial({ 
      color: 0x22d3ee, 
      transparent: true, 
      opacity: 0,
      side: THREE.DoubleSide 
    });
    const targetBracket = new THREE.Mesh(targetBracketGeo, targetBracketMat);
    targetBracket.rotation.x = Math.PI / 2;
    scene.add(targetBracket);

    const raycaster = new THREE.Raycaster();

    const updateMouse = (x: number, y: number) => {
      lastMousePosRef.current.copy(mouseRef.current);
      mouseRef.current.x = (x / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(y / window.innerHeight) * 2 + 1;
    };

    const onMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updateMouse(e.touches[0].clientX, e.touches[0].clientY);
    };

    const onMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) {
        setIsMouseDown(true);
        updateMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onMouseUp = () => setIsMouseDown(false);
    const onTouchEnd = () => setIsMouseDown(false);

    
    
    
    
    
    
    
    
    

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let nextEmitIndex = 0;

    const defaultCameraPos = new THREE.Vector3(0, 800, 1200);
    const currentTarget = new THREE.Vector3(0, 0, 0);
    const targetCameraPos = defaultCameraPos.clone();

    
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      raycaster.setFromCamera(mouseRef.current, camera);
      const mouse3D = new THREE.Vector3();
      
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      raycaster.ray.intersectPlane(plane, mouse3D);

      
      let closestPlanetName: string | null = null;
      let minHoverDist = Infinity;
      let targetPos = new THREE.Vector3();

      
      if (grabbedPlanetRef.current) {
        closestPlanetName = grabbedPlanetRef.current;
        if (closestPlanetName === 'Sun') {
          targetPos.set(0, 0, 0);
        } else {
          const p = planets.find(pl => pl.data.name === closestPlanetName);
          if (p) targetPos.copy(p.mesh.position);
        }
      } else {
        
        const sunDist = new THREE.Vector3(0, 0, 0).distanceTo(mouse3D);
        const sunThreshold = hoveredPlanetRef.current === 'Sun' ? 400 : 300;
        if (sunDist < sunThreshold) {
          closestPlanetName = 'Sun';
          minHoverDist = sunDist;
          targetPos.set(0, 0, 0);
        }

        planets.forEach(p => {
          const dist = p.mesh.position.distanceTo(mouse3D);
          
          const planetThreshold = hoveredPlanetRef.current === p.data.name ? 350 : 250;
          if (dist < planetThreshold && dist < minHoverDist) {
            minHoverDist = dist;
            closestPlanetName = p.data.name;
            targetPos.copy(p.mesh.position);
          }
        });
      }

      if (closestPlanetName !== hoveredPlanetRef.current) {
        hoveredPlanetRef.current = closestPlanetName;
        setHoveredPlanet(closestPlanetName);
        hoverLockRef.current = 0; 
      }

      
      if (closestPlanetName && !grabbedPlanetRef.current) {
        
        const lockSpeed = closestPlanetName === 'Sun' ? 0.08 : 0.05;
        hoverLockRef.current = Math.min(1, hoverLockRef.current + lockSpeed);
      } else if (!grabbedPlanetRef.current) {
        hoverLockRef.current = Math.max(0, hoverLockRef.current - 0.1);
      }
      
      
      if (Math.abs(hoverLockRef.current - hoverLock) > 0.01) {
        setHoverLock(hoverLockRef.current);
      }

      
      if (closestPlanetName) {
        targetBracket.position.lerp(targetPos, 0.2);
        targetBracket.scale.setScalar((closestPlanetName === 'Sun' ? 2.5 : 1.5) * (0.8 + hoverLockRef.current * 0.2));
        targetBracket.rotation.z += 0.05;
        (targetBracketMat as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp((targetBracketMat as THREE.MeshBasicMaterial).opacity, 0.4 + hoverLockRef.current * 0.4, 0.1);
      } else {
        (targetBracketMat as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp((targetBracketMat as THREE.MeshBasicMaterial).opacity, 0, 0.1);
      }

      
      if (isMouseDownRef.current && !grabbedPlanetRef.current) {
        
        if (hoveredPlanetRef.current && hoverLockRef.current > 0.2) {
          const targetName = hoveredPlanetRef.current;
          grabbedPlanetRef.current = targetName;
          setGrabbedPlanet(targetName);
          
          
          if (targetName === 'Sun') {
            grabOffsetRef.current.copy(new THREE.Vector3(0, 0, 0)).sub(mouse3D);
          } else {
            const p = planets.find(pl => pl.data.name === targetName);
            if (p) {
              grabOffsetRef.current.copy(p.mesh.position).sub(mouse3D);
            }
          }
        }
      } else if (!isMouseDownRef.current) {
        grabbedPlanetRef.current = null;
        setGrabbedPlanet(null);
      }

      
      const grabbedPlanetObj = planets.find(p => p.data.name === grabbedPlanetRef.current);
      if (grabbedPlanetObj) {
        
        currentTarget.lerp(grabbedPlanetObj.mesh.position, 0.05);
        
        
        const dir = grabbedPlanetObj.mesh.position.clone().normalize();
        if (dir.length() === 0) dir.set(0, 0, 1);
        
        const zoomOffset = dir.multiplyScalar(150).add(new THREE.Vector3(0, 100, 0));
        targetCameraPos.copy(grabbedPlanetObj.mesh.position).add(zoomOffset);
      } else if (grabbedPlanetRef.current === 'Sun') {
        
        currentTarget.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        targetCameraPos.set(0, 300, 600);
      } else {
        
        currentTarget.lerp(new THREE.Vector3(0, 0, 0), 0.05);
        targetCameraPos.copy(defaultCameraPos);
      }

      camera.position.lerp(targetCameraPos, 0.05);
      camera.lookAt(currentTarget);

      
      planets.forEach(p => {
        const isGrabbed = grabbedPlanetRef.current === p.data.name;
        
        
        (p.orbitRing.material as THREE.MeshBasicMaterial).opacity = isGrabbed ? 0.4 : 0.1;
        (p.orbitRing.material as THREE.MeshBasicMaterial).color.setHex(isGrabbed ? 0x22d3ee : 0xffffff);
        
        
        p.orbitRing.scale.setScalar(p.currentRadius / p.data.orbitRadius);

        if (isGrabbed) {
          
          const targetPos = mouse3D.clone().add(grabOffsetRef.current);
          p.mesh.position.lerp(targetPos, 0.1);
          p.currentRadius = Math.sqrt(p.mesh.position.x ** 2 + p.mesh.position.z ** 2);
          p.angle = Math.atan2(p.mesh.position.z, p.mesh.position.x);
        } else {
          
          let speedMult = 1;
          if (interactionModeRef.current === 'vortex' && isMouseDownRef.current) {
            speedMult = 5;
            
            p.mesh.position.y = Math.sin(Date.now() * 0.005 + p.angle) * 20;
          }

          if (interactionModeRef.current === 'repel' && isMouseDownRef.current) {
            const distToMouse = p.mesh.position.distanceTo(mouse3D);
            if (distToMouse < 300) {
              const force = (300 - distToMouse) / 300;
              const dir = p.mesh.position.clone().sub(mouse3D).normalize();
              p.mesh.position.add(dir.multiplyScalar(force * 10));
              p.currentRadius = Math.sqrt(p.mesh.position.x ** 2 + p.mesh.position.z ** 2);
              p.angle = Math.atan2(p.mesh.position.z, p.mesh.position.x);
            }
          }

          
          p.angle += p.data.speed * speedMult;
          const targetX = Math.cos(p.angle) * p.currentRadius;
          const targetZ = Math.sin(p.angle) * p.currentRadius;
          p.mesh.position.x = THREE.MathUtils.lerp(p.mesh.position.x, targetX, 0.05);
          p.mesh.position.z = THREE.MathUtils.lerp(p.mesh.position.z, targetZ, 0.05);
          p.mesh.position.y = THREE.MathUtils.lerp(p.mesh.position.y, 0, 0.05);
        }
        
        p.mesh.rotation.y += 0.01;

        
        const positions = p.trail.geometry.attributes.position.array as Float32Array;
        for (let i = positions.length - 1; i >= 3; i--) {
          positions[i] = positions[i - 3];
        }
        positions[0] = p.mesh.position.x;
        positions[1] = p.mesh.position.y;
        positions[2] = p.mesh.position.z;
        p.trail.geometry.attributes.position.needsUpdate = true;
      });

      sun.rotation.y += 0.005;
      sunGlow.scale.setScalar(1 + Math.sin(Date.now() * 0.002) * 0.05);
      stars.rotation.y += 0.0001;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      coronaTexture.dispose();
      coronaMat.dispose();
scene.traverse((object: THREE.Object3D) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
if (Array.isArray((object as any).material)) {
            (object as any).material.forEach((m: any) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#010101] text-white font-sans select-none touch-none"
      id="nebula-container"
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0 cursor-none" id="nebula-canvas" />
      
      {/* Camera Preview Window */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bottom-6 right-6 z-20 w-48 h-36 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl pointer-events-auto group"
        id="camera-preview-container"
      >
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover scale-x-[-1] opacity-60 group-hover:opacity-100 transition-opacity" 
          playsInline 
          muted 
        />
        
        {/* HUD Elements for Camera */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border border-cyan-500/20 rounded-2xl" />
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isCameraActive ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`} /> 
            <span className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Feed: {isCameraActive ? 'Active' : 'Offline'}</span>
          </div>
          
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/50" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/50" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-400/50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/50" />
          
          {/* Hand Detection Overlay */}
          {handDetected && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-cyan-400/5 flex items-center justify-center"
            >
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter opacity-50">Hand Locked</div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Custom Cursor with Dynamic Feedback */}
      <motion.div 
        className="fixed top-0 left-0 w-20 h-20 pointer-events-none z-[100] flex items-center justify-center"
        animate={{ 
          x: mouseRef.current.x * (window.innerWidth / 2) + (window.innerWidth / 2) - 40,
          y: -mouseRef.current.y * (window.innerHeight / 2) + (window.innerHeight / 2) - 40,
          scale: isMouseDown ? 0.8 : (handDetected ? 1 : 0.4),
          opacity: handDetected ? 1 : 0.2
        }}
        transition={{ type: 'spring', damping: 35, stiffness: 600, mass: 0.3 }}
      >
        {/* 360 Target Reticle */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {/* Outer Rotating Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="rgba(34, 211, 238, 0.2)"
            strokeWidth="0.5"
            strokeDasharray="10 5"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
          />
          
          {/* Main 360 Ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={isMouseDown ? "#fff" : (hoveredPlanet ? "#22d3ee" : "rgba(255,255,255,0.15)")}
            strokeWidth={isMouseDown ? "3" : "1.5"}
            strokeDasharray="251"
            animate={{ 
              strokeDashoffset: hoveredPlanet ? 0 : 251,
              rotate: hoveredPlanet ? 0 : -90,
              scale: isMouseDown ? 1.1 : 1
            }}
            transition={{ duration: 0.6, ease: "circOut" }}
          />

          {/* Lock-on Progress Ring */}
          {hoveredPlanet && !isMouseDown && (
            <motion.circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1"
              strokeDasharray="220"
              animate={{ 
                strokeDashoffset: 220 - (220 * hoverLock),
                opacity: hoverLock
              }}
            />
          )}

          {/* Crosshair Brackets */}
          {[0, 90, 180, 270].map((angle) => (
            <motion.path
              key={angle}
              d="M50 2 L50 10"
              stroke={hoveredPlanet ? "#22d3ee" : "rgba(255,255,255,0.3)"}
              strokeWidth="2"
              transform={`rotate(${angle} 50 50)`}
              animate={{ 
                y: hoveredPlanet ? -2 : 0,
                opacity: hoveredPlanet ? 1 : 0.5
              }}
            />
          ))}

          {/* Center Dot */}
          <circle cx="50" cy="50" r="2" fill={isMouseDown ? "#fff" : "#22d3ee"} />
        </svg>

        {/* Target Label */}
        <AnimatePresence>
          {hoveredPlanet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              className="absolute top-[-40px] flex flex-col items-center"
            >
              <div className="px-3 py-1 bg-cyan-500/20 border border-cyan-400/50 backdrop-blur-xl rounded-lg">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                  Target: {hoveredPlanet}
                </span>
              </div>
              <div className="w-px h-4 bg-gradient-to-b from-cyan-400 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interaction Mode Indicator */}
        {isMouseDown && (
          <motion.div 
            className="absolute inset-0 rounded-full border border-white/20"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </motion.div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-10">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div className="group">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic font-serif leading-none transition-all group-hover:tracking-normal" id="app-title">
              Solar <span className="text-cyan-400">System</span>
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="px-2 py-0.5 bg-cyan-500 text-[8px] font-black text-black rounded uppercase tracking-tighter">Live</span>
              <p className="text-[9px] uppercase tracking-[0.4em] opacity-30 font-mono">
                Gestural Celestial Engine
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="pointer-events-auto p-4 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all active:scale-95"
            id="info-toggle"
          >
            <Info size={24} />
          </button>
        </motion.header>

        <div className="flex flex-col gap-8 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="pointer-events-auto flex flex-col gap-4"
          >
            <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 rounded-[24px] border border-white/5 backdrop-blur-2xl shadow-2xl">
              {[
                { id: 'grab', icon: Hand, label: 'Grab &amp; Pull' },
                { id: 'repel', icon: Target, label: 'Repel' },
                { id: 'vortex', icon: RotateCw, label: 'Vortex' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setInteractionMode(mode.id as InteractionMode)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[18px] transition-all duration-500 text-[10px] font-black uppercase tracking-widest ${
                    interactionMode === mode.id 
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_10px_30px_rgba(34,211,238,0.3)]' 
                      : 'hover:bg-white/5 text-white/40'
                  }`}
                >
                  <mode.icon size={14} />
                  <span className="hidden md:inline">{mode.label}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2 px-4">
              <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-white/30 font-mono">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${handDetected ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-white/10'}`} />
                Neural Link: {handDetected ? 'Synchronized' : 'Searching...'}
              </div>
              {grabbedPlanet && (
                <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] text-cyan-400 font-mono animate-pulse">
                  <Globe size={10} /> Manipulating: {grabbedPlanet}
                </div>
              )}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-white/20 font-mono">
                  <Orbit size={10} /> Pinch to Grab
                </div>
                <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest text-white/20 font-mono">
                  <Move size={10} /> Pull to Rescale
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
            id="info-modal"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-xl w-full bg-[#050505] border border-white/5 p-12 rounded-[50px] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500" />
              
              <h2 className="text-4xl font-black mb-8 italic font-serif tracking-tighter">Celestial Mastery</h2>
              
              <div className="grid gap-8 mb-12">
                {[
                  { icon: Hand, title: 'Orbital Manipulation', desc: 'Pinch near a planet to grab it. Pull your hand away from or toward the sun to rescale its orbit.' },
                  { icon: Sun, title: 'Solar Core', desc: 'The sun serves as the gravitational anchor for all planetary bodies in your system.' },
                  { icon: Orbit, title: 'Dynamic Rescaling', desc: 'Planets maintain their new orbital distance even after you release them, allowing for custom system layouts.' },
                  { icon: RotateCw, title: 'Vortex Surge', desc: 'Activate Vortex mode to accelerate planetary rotation and create gravitational disturbances.' },
                  { icon: Target, title: 'Repulsion Field', desc: 'Create a localized anti-gravity field that temporarily pushes planets out of their stable paths.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:border-cyan-500/50 transition-colors">
                      <item.icon size={24} className="text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg uppercase tracking-tight mb-1">{item.title}</h3>
                      <p className="text-sm text-white/30 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowInfo(false)}
                className="w-full py-6 bg-cyan-500 text-black font-black rounded-3xl hover:bg-white transition-all uppercase tracking-[0.3em] text-xs shadow-xl active:scale-95"
                id="close-info"
              >
                Enter the Void
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] bg-cyan-500/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[80%] h-[80%] bg-purple-500/5 rounded-full blur-[200px]" />
      </div>
    </div>
  );
}
