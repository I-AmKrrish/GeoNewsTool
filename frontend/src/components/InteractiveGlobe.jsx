import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { motion } from 'framer-motion';

/**
 * Interactive 3D Globe powered by cobe
 * Accurately aligns with Stitch design with soft glowing ambient halo
 * and interactive cursor dragging / smooth coordinate targeting.
 */
export default function InteractiveGlobe({
  targetLat = 35.6762,
  targetLon = 139.6503,
  isTargetActive = false,
  className = "",
  size = 280
}) {
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.2);

  // Convert lat/lon into target theta and phi
  useEffect(() => {
    if (isTargetActive) {
      // Theta is latitude in radians [-pi/2, pi/2]
      // Phi is longitude in radians
      const targetTheta = (targetLat * Math.PI) / 180;
      const targetPhi = -(targetLon * Math.PI) / 180 - Math.PI / 2;
      
      // Smoothly transition over frames
      let startPhi = phiRef.current;
      let startTheta = thetaRef.current;
      let progress = 0;

      const interval = setInterval(() => {
        progress += 0.05;
        if (progress >= 1) {
          phiRef.current = targetPhi;
          thetaRef.current = targetTheta;
          clearInterval(interval);
        } else {
          phiRef.current = startPhi + (targetPhi - startPhi) * progress;
          thetaRef.current = startTheta + (targetTheta - startTheta) * progress;
        }
      }, 16);

      return () => clearInterval(interval);
    }
  }, [targetLat, targetLon, isTargetActive]);

  useEffect(() => {
    let width = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onResize = () => {
      if (canvas) {
        width = canvas.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 2, 2),
      width: (width || size) * 2,
      height: (width || size) * 2,
      phi: 0,
      theta: 0.2,
      dark: 0, // Clean light aesthetic matching Stitch
      diffuse: 1.2,
      mapSamples: 14000,
      mapBrightness: 4.5,
      baseColor: [0.82, 0.9, 0.99],
      markerColor: [0.15, 0.45, 0.95],
      glowColor: [0.75, 0.88, 1],
      markers: isTargetActive
        ? [{ location: [targetLat, targetLon], size: 0.1 }]
        : [
            { location: [35.6762, 139.6503], size: 0.05 },
            { location: [12.9716, 77.5946], size: 0.05 },
            { location: [51.5074, -0.1278], size: 0.05 },
            { location: [37.7749, -122.4194], size: 0.05 },
          ],
      onRender: (state) => {
        if (!pointerInteracting.current && !isTargetActive) {
          phiRef.current += 0.003;
        }
        state.phi = phiRef.current + pointerInteractionMovement.current;
        state.theta = thetaRef.current;
        state.width = (width || size) * 2;
        state.height = (width || size) * 2;
      },
    });

    return () => {
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [targetLat, targetLon, isTargetActive, size]);

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Outer ambient glow rings matching Stitch design */}
      <div 
        className="absolute rounded-full bg-gradient-to-tr from-blue-100/70 via-sky-100/50 to-indigo-100/60 blur-2xl pointer-events-none transition-all duration-700"
        style={{
          width: size * 1.35,
          height: size * 1.35,
        }}
      />
      <div 
        className="absolute rounded-full border border-sky-100/80 bg-white/40 backdrop-blur-xs shadow-inner pointer-events-none"
        style={{
          width: size * 1.15,
          height: size * 1.15,
        }}
      />

      {/* Canvas container */}
      <div 
        className="relative z-10 cursor-grab active:cursor-grabbing rounded-full overflow-hidden flex items-center justify-center"
        style={{ width: size, height: size }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
          canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.006;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.006;
          }
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            contain: 'layout paint size',
            opacity: 0.95,
          }}
        />
      </div>

      {/* Badge Pill: ● Interactive 3D */}
      <motion.div 
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 mt-[-14px] bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-full px-3 py-1 shadow-sm flex items-center gap-1.5 pointer-events-none select-none"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
        <span className="text-[11px] font-medium tracking-wide text-slate-600">
          Interactive 3D
        </span>
      </motion.div>
    </div>
  );
}
