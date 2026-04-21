"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Html } from "@react-three/drei";
import ThreeGlobe from "three-globe";
import * as THREE from "three";
import { cn } from "@/lib/utils";

export interface GlobeMarker {
  lat: number;
  lng: number;
  label: string;
  src?: string;
  size?: number;
  color?: string;
}

export interface GlobeArc {
  order: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcAlt: number;
  color: string | string[];
  [key: string]: any;
}

interface Globe3DConfig {
  pointColor?: string;
  glowColor?: string;
  waterColor?: string;
  highlightColor?: string;
  atmosphereColor?: string;
  atmosphereIntensity?: number;
  showAtmosphere?: boolean;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  zoomSpeed?: number;
  enableZoom?: boolean;
  bumpScale?: number;
}

interface Globe3DProps {
  markers?: GlobeMarker[];
  arcs?: GlobeArc[];
  config?: Globe3DConfig;
  className?: string;
  focusPoint?: { lat: number; lng: number } | null;
  onMarkerClick?: (marker: GlobeMarker) => void;
  onMarkerHover?: (marker: GlobeMarker | null) => void;
  onArcHover?: (arc: GlobeArc | null, event: any) => void;
}

const DEFAULT_CONFIG: Globe3DConfig = {
  pointColor: "#3b82f6",
  glowColor: "#3b82f6",
  waterColor: "#000000",
  highlightColor: "#3b82f6",
  atmosphereColor: "#3b82f6",
  atmosphereIntensity: 10,
  showAtmosphere: true,
  arcTime: 2000,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  autoRotate: true,
  autoRotateSpeed: 0.03,
  zoomSpeed: 1,
  enableZoom: true,
  bumpScale: 5,
};

function GlobeInner({ markers = [], arcs = [], config = {}, onArcHover, focusPoint }: Omit<Globe3DProps, "className">) {
  const [globe, setGlobe] = useState<ThreeGlobe | null>(null);
  const [countries, setCountries] = useState<{ features: any[] }>({ features: [] });
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { raycaster } = useThree();

  useEffect(() => {
    // Increase line hit-test area significantly for easier hovering
    if (raycaster.params.Line) {
      raycaster.params.Line.threshold = 5; 
    }
  }, [raycaster]);

  useEffect(() => {
    // Highly reliable source for country polygons
    fetch("https://raw.githubusercontent.com/vasturiano/three-globe/master/example/country-polygons/ne_110m_admin_0_countries.geojson")
      .then(res => res.json())
      .then(data => {
        if (data && data.features) setCountries(data);
      })
      .catch(err => console.error("Globe data error:", err));
  }, []);

  useEffect(() => {
    const instance = new ThreeGlobe()
      .showGlobe(true)
      .showAtmosphere(true)
      .atmosphereColor("#3b82f6")
      .pointColor(() => "#ffffff")
      .pointsData(markers)
      .pointsMerge(false)
      .pointAltitude(0.02)
      .pointRadius(0.4)
      .arcsData(arcs)
      .arcColor((d: any) => d.color || "#ffffff") 
      .arcAltitude(() => 0.015) 
      .arcStroke(() => 0.8) 
      .arcDashLength(() => 0.2) 
      .arcDashGap(() => 0.08) 
      .arcDashAnimateTime(() => 6000)
      .ringsData(markers)
      .ringColor(() => "#ffffff")
      .ringMaxRadius(() => 1.2)
      .ringPropagationSpeed(() => 1)
      .ringRepeatPeriod(() => 2000)
      .ringAltitude(0.018)
      // Country Polygons - FIXED HEIGHT
      .polygonsData(countries.features)
      .polygonCapColor(() => "#166534")
      .polygonSideColor(() => "#166534")
      .polygonStrokeColor(() => "#22c55e")
      .polygonAltitude(0.01);

    const globeMaterial = instance.globeMaterial() as any;
    globeMaterial.color = new THREE.Color("#062056");
    globeMaterial.emissive = new THREE.Color("#082f49");
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 0.9;

    setGlobe(instance);
  }, [countries]);

  const [hoveredArc, setHoveredArc] = useState<any>(null);

  useEffect(() => {
    if (!globe) return;
    
    globe
      .pointsData(markers)
      .ringsData(markers)
      .arcsData(arcs)
      .arcColor((d: any) => d.color || "#ffffff")
      .arcStroke(0.8)
      .arcDashLength(0.2)
      .arcDashGap(0.08)
      .arcDashAnimateTime(6000);
    
    // Minimized native markers
    globe.pointRadius(0.5);
    globe.pointColor(() => "#ffffff");
    globe.ringMaxRadius(2.5);
    globe.ringColor(() => "#ffffff");
    globe.arcAltitude(0.025);
  }, [globe, arcs, markers]);

  const { camera } = useThree();

  useEffect(() => {
    if (!globe || !focusPoint) return;
    
    // Calculate 3D coordinates for the target city at a tactical distance
    const { x, y, z } = globe.getCoords(focusPoint.lat, focusPoint.lng, 1.2);
    
    // Perform cinematic camera drift
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }, [globe, focusPoint, camera]);

  const handlePointerMove = (e: any) => {
    e.stopPropagation();
    if (!globe || !e.intersections) return;
    
    // Search through all intersections to find the arc data
    const intersect = e.intersections.find((i: any) => i && i.object && (i.object.__data || i.object.parent?.__data));
    const data = intersect?.object?.__data || intersect?.object?.parent?.__data;
    
    if (data && data.startLat) {
      setHoveredArc(data);
    } else {
      setHoveredArc(null);
    }

    if (data && (data.playerName || data.startLat)) {
      onArcHover?.(data as GlobeArc, e);
    } else {
      onArcHover?.(null, e);
    }
  };

  if (!globe) return null;
  
  return (
    <group>
      <primitive 
        object={globe} 
        onPointerMove={handlePointerMove}
        onPointerOut={() => {
          setHoveredArc(null);
          onArcHover?.(null, {});
        }}
      />
      {markers.map((marker, i) => {
        const coords = globe.getCoords(marker.lat, marker.lng, 0.2);
        const isVisible = hoveredArc && (
          String(hoveredArc.fromTeamID) === String(marker.label) || 
          String(hoveredArc.toTeamID) === String(marker.label)
        );

        return (
          <Html
            key={`marker-${i}`}
            position={[coords.x, coords.y, coords.z]}
            center
            style={{ 
              pointerEvents: 'none',
              transition: 'opacity 1.0s cubic-bezier(0.23, 1, 0.32, 1)',
              opacity: isVisible ? 1 : 0
            }}
          >
            <div className="flex items-center justify-center">
              {marker.src && (
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src={marker.src}
                    className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.95)]"
                    alt="club logo"
                  />
                </div>
              )}
            </div>
          </Html>
        );
      })}
    </group>
  );
}

export function Globe3D({ markers, arcs, config, className, onMarkerClick, onMarkerHover, onArcHover, focusPoint }: Globe3DProps) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  return (
    <div className={cn("relative w-full h-[600px] overflow-hidden", className)}>
      <Canvas 
        camera={{ position: [30, 180, 160], fov: 45 }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 2.2
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={3.5} />
        <hemisphereLight intensity={2.0} groundColor="#000000" color="#ffffff" />
        <directionalLight position={[10, 10, 300]} intensity={3.0} />
        <pointLight position={[200, 200, 200]} intensity={4} />
        <pointLight position={[-200, -200, -200]} intensity={2.5} color="#3b82f6" />
        <spotLight position={[0, 1000, 0]} intensity={6} angle={0.3} penumbra={1} castShadow />
        <GlobeInner 
          markers={markers} 
          arcs={arcs} 
          config={mergedConfig} 
          onArcHover={onArcHover}
          focusPoint={focusPoint}
        />
        <OrbitControls
          enablePan={false}
          enableZoom={mergedConfig.enableZoom}
          zoomSpeed={mergedConfig.zoomSpeed}
          autoRotate={mergedConfig.autoRotate && !focusPoint}
          autoRotateSpeed={mergedConfig.autoRotateSpeed}
          minDistance={200}
          maxDistance={500}
        />
      </Canvas>
    </div>
  );
}
