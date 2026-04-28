"use client";

import { useState, useEffect, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const FootballGlobe = dynamic(() => import("@/components/ui/football-globe").then(mod => mod.FootballGlobe), { 
  ssr: false,
  loading: () => <div className="w-40 h-40 bg-blue-500/5 animate-pulse rounded-full" />
});

interface Marker {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

interface Arc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color?: string;
  toTeamLogo?: string;
}

interface TacticalMapProps {
  markers?: Marker[];
  arcs?: Arc[];
  className?: string;
}

// Simple projection function (Mercator)
function project(lat: number, lng: number, width: number, height: number) {
  const x = (lng + 180) * (width / 360);
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = height / 2 - (width * mercN) / (2 * Math.PI);
  return [x, y];
}

export const TacticalMap = memo(({ markers = [], arcs = [], className }: TacticalMapProps) => {
  const [countries, setCountries] = useState<any[]>([]);
  const width = 1000;
  const height = 600;

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/vasturiano/three-globe/master/example/country-polygons/ne_110m_admin_0_countries.geojson")
      .then(res => res.json())
      .then(data => setCountries(data.features))
      .catch(err => console.error("Map data error:", err));
  }, []);

  return (
    <div className={`relative w-full h-full bg-background overflow-hidden flex items-center justify-center p-4 transition-colors duration-300 ${className || ""}`}>
      {/* 3D Tilted Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{
          perspective: "2000px",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div 
          initial={{ rotateX: 35, rotateZ: -10, scale: 0.8, opacity: 0 }}
          animate={{ rotateX: 25, rotateZ: -5, scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative w-[95%] aspect-[16/9] bg-card border border-border rounded-2xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden"
        >
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-[0.03] text-foreground" style={{
            backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />

          <svg
            viewBox="0 0 1000 600"
            className="w-full h-full overflow-visible scale-[1.2]"
          >
            {/* Countries Rendering (Memoized) */}
            {useMemo(() => (
              <g className="countries opacity-40">
                {countries.map((feature, i) => {
                  if (!feature.geometry) return null;
                  const coords = feature.geometry.type === "Polygon" 
                    ? [feature.geometry.coordinates] 
                    : feature.geometry.coordinates;

                  return coords.map((polygon: any[], j: number) => (
                    <path
                      key={`country-${i}-${j}`}
                      d={polygon[0].map((pt: any, k: number) => {
                        const [px, py] = project(pt[1], pt[0], width, height);
                        return `${k === 0 ? 'M' : 'L'} ${px} ${py}`;
                      }).join(' ')}
                      fill="currentColor"
                      className="text-secondary/10 dark:text-secondary/40"
                      stroke="currentColor"
                      strokeWidth="0.2"
                      style={{ color: 'inherit' }}
                    />
                  ));
                })}
              </g>
            ), [countries])}

            {/* Arcs as Dashed Lines with Crests */}
            <g className="arcs">
              {arcs.map((arc: any, i) => {
                const [x1, y1] = project(arc.startLat, arc.startLng, width, height);
                const [x2, y2] = project(arc.endLat, arc.endLng, width, height);
                
                // Curve factor
                const dx = x2 - x1;
                const dy = y2 - y1;
                const dr = Math.sqrt(dx * dx + dy * dy);

                // Midpoint for crest
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2 - (dr * 0.08); // Slight arc lift

                return (
                  <g key={`arc-group-${i}`}>
                    <motion.path
                      d={`M ${x1} ${y1} A ${dr} ${dr} 0 0 1 ${x2} ${y2}`}
                      stroke={arc.color || "#facc15"}
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray="6 10"
                      initial={{ strokeDashoffset: 200 } as any}
                      animate={{ strokeDashoffset: 0 } as any}
                      transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="opacity-80"
                    />
                    
                    {/* Club Crest Badge on the Vector - SVG Native Implementation */}
                    {arc.toTeamLogo && (
                       <g transform={`translate(${midX},${midY})`}>
                          <circle r="16" fill="var(--color-secondary)" stroke="var(--color-border)" strokeWidth="1" />
                          <clipPath id={`clip-${i}`}>
                             <circle r="14" />
                          </clipPath>
                          <image 
                            href={arc.toTeamLogo} 
                            x="-12" 
                            y="-12" 
                            width="24" 
                            height="24" 
                            clipPath={`url(#clip-${i})`}
                            preserveAspectRatio="xMidYMid meet"
                          />
                          <circle r="16" fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth="2" className="animate-pulse" />
                       </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Markers */}
            <g className="markers">
              {markers.map((marker, i) => {
                const [x, y] = project(marker.lat, marker.lng, width, height);
                return (
                  <g key={`marker-${i}`}>
                    <circle cx={x} cy={y} r="5" fill="var(--color-primary)" />
                    <circle cx={x} cy={y} r="15" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" className="animate-ping opacity-20" />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Central Ball Anchor */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 relative">
              <FootballGlobe 
                config={{ 
                  autoRotate: true, 
                  autoRotateSpeed: 1,
                  enableZoom: false 
                }} 
              />
              {/* Glow effect behind the ball */}
              <div className="absolute inset-0 bg-blue-500/10 blur-[60px] rounded-full -z-10" />
            </div>
          </div>

          {/* Interface Decor */}
          <div className="absolute inset-0 pointer-events-none border-[1px] border-border rounded-2xl" />
          <div className="absolute bottom-6 right-8 font-mono text-[10px] text-muted-foreground/30 whitespace-pre">
            {`LAT_SYNC [OK]\nLNG_PROP [ACTIVE]\nREF_FRAME: WGS84`}
          </div>
          <div className="absolute top-6 left-8 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
             <span className="text-[#facc15] text-[10px] font-mono tracking-widest uppercase font-bold">Tactical_Map_v2</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

TacticalMap.displayName = 'TacticalMap';
