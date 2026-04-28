'use client'

import React, { useMemo } from 'react'
import { COUNTRY_DATA } from '@/lib/europe-map-data'

/**
 * TacticalSchematicMap
 * A high-fidelity, geospatial intelligence visualization for player transfers.
 * Displays accurate, high-resolution geographic boundaries for European countries.
 */

/**
 * Utility to convert Lat/Lng to SVG coordinates based on a projection.
 */
function latLngToSvg(lat: number, lng: number, vbW = 100, vbH = 100): [number, number] {
  const minLng = -12, maxLng = 45
  const minLat = 34, maxLat = 65
  const x = ((lng - minLng) / (maxLng - minLng)) * vbW
  const y = ((maxLat - lat) / (maxLat - minLat)) * vbH
  return [x, y]
}

/**
 * Checks if a point is inside a GeoJSON geometry.
 */
function isPointInCountry(pt: [number, number], geometry: any): boolean {
  if (!geometry) return false;
  let polygons = geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates];
  
  const x = pt[0], y = pt[1]; // lat, lng
  
  for (const polygon of polygons) {
    const ring = polygon[0]; // exterior ring
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const latI = ring[i][1], lngI = ring[i][0];
      const latJ = ring[j][1], lngJ = ring[j][0];
      
      const intersect = ((lngI > y) !== (lngJ > y)) && (x < (latJ - latI) * (y - lngI) / (lngJ - lngI) + latI);
      if (intersect) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

/**
 * Checks if a line segment intersects a bounding box.
 */
function lineIntersectsBox(p1: [number, number], p2: [number, number], box: { minLat: number; maxLat: number; minLng: number; maxLng: number }): boolean {
  const p1In = p1[0] >= box.minLat && p1[0] <= box.maxLat && p1[1] >= box.minLng && p1[1] <= box.maxLng;
  const p2In = p2[0] >= box.minLat && p2[0] <= box.maxLat && p2[1] >= box.minLng && p2[1] <= box.maxLng;
  if (p1In || p2In) return true;

  const midLat = (p1[0] + p2[0]) / 2;
  const midLng = (p1[1] + p2[1]) / 2;
  return midLat >= box.minLat && midLat <= box.maxLat && midLng >= box.minLng && midLng <= box.maxLng;
}

export function TacticalSchematicMap({
  start,
  end,
  color = 'hsl(var(--secondary))',
  playerName,
  logoUrl
}: {
  start: [number, number] | null
  end: [number, number] | null
  color?: string
  playerName?: string
  logoUrl?: string
}) {
  const VBW = 100
  const VBH = 100

  const countryClassification = useMemo(() => {
    const active = new Set<string>();
    const context = new Set<string>();
    if (!start && !end) return { active, context };

    const s = start || [48.8, 2.3];
    const e = end || s;

    Object.entries(COUNTRY_DATA).forEach(([code, data]) => {
      // Fix Russia's bounds spanning the globe due to islands crossing the antimeridian
      const bounds = code === 'RU' 
        ? { minLat: 41, maxLat: 82, minLng: 19, maxLng: 60 } 
        : data.bounds;

      const isOrigin = isPointInCountry(s as [number, number], data.geometry);
      const isDest = isPointInCountry(e as [number, number], data.geometry);
      
      if (isOrigin || isDest) {
        active.add(code);
      } else if (lineIntersectsBox(s as [number, number], e as [number, number], bounds)) {
        context.add(code);
      }
    });

    const allCore = new Set([...active, ...context]);
    allCore.forEach(code => {
      const coreBounds = code === 'RU' ? { minLat: 41, maxLat: 82, minLng: 19, maxLng: 60 } : COUNTRY_DATA[code].bounds;
      const pad = 2.0;
      Object.entries(COUNTRY_DATA).forEach(([otherCode, otherData]) => {
        if (active.has(otherCode) || context.has(otherCode)) return;
        const ob = otherCode === 'RU' ? { minLat: 41, maxLat: 82, minLng: 19, maxLng: 60 } : otherData.bounds;
        
        const overlapsLat = ob.minLat <= coreBounds.maxLat + pad && ob.maxLat >= coreBounds.minLat - pad;
        const overlapsLng = ob.minLng <= coreBounds.maxLng + pad && ob.maxLng >= coreBounds.minLng - pad;
        if (overlapsLat && overlapsLng) {
          context.add(otherCode);
        }
      });
    });

    return { active, context };
  }, [start, end]);

  const p1 = start ? latLngToSvg(start[0], start[1], VBW, VBH) : null;
  const p2 = end ? latLngToSvg(end[0], end[1], VBW, VBH) : null;

  const vBox = useMemo(() => {
    if (!p1 || !p2) return `0 0 ${VBW} ${VBH}`;
    const minX = Math.min(p1[0], p2[0]), maxX = Math.max(p1[0], p2[0]);
    const minY = Math.min(p1[1], p2[1]), maxY = Math.max(p1[1], p2[1]);
    const width = maxX - minX, height = maxY - minY;
    const paddingX = Math.max(30, width * 2.2), paddingY = Math.max(30, height * 2.2);
    const centerX = (minX + maxX) / 2, centerY = (minY + maxY) / 2;
    const finalSize = Math.max(width + paddingX, height + paddingY, 60);
    return `${centerX - finalSize/2} ${centerY - finalSize/2} ${finalSize} ${finalSize}`;
  }, [p1, p2]);

  const arrowElements = useMemo(() => {
    if (!p1 || !p2) return null;
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1], dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return null;
    const ux = dx / dist, uy = dy / dist;
    const sx = p1[0] + ux * 2.5, sy = p1[1] + uy * 2.5, ex = p2[0] - ux * 5, ey = p2[1] - uy * 5;
    const hSize = Math.min(3, dist * 0.2), nx = -uy, ny = ux;
    return {
      line: `M ${sx} ${sy} L ${ex} ${ey}`,
      head: `${ex},${ey} ${ex - ux * hSize + nx * hSize * 0.6},${ey - uy * hSize + ny * hSize * 0.6} ${ex - ux * hSize - nx * hSize * 0.6},${ey - uy * hSize - ny * hSize * 0.6}`
    };
  }, [p1, p2]);

  return (
    <div className="w-full h-full bg-accent/20 relative overflow-hidden flex items-center justify-center font-sans">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `linear-gradient(to right, hsl(var(--secondary)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--secondary)) 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 via-transparent to-secondary/5 pointer-events-none" />

      <svg viewBox={vBox} className="w-full h-full max-w-[500px] drop-shadow-2xl transition-all duration-1000 ease-in-out">
        <defs>
          <filter id="glow-fx" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {Array.from(countryClassification.context).map(code => {
          const data = COUNTRY_DATA[code];
          if (!data || !data.geometry) return null;
          
          let polygons = data.geometry.type === 'MultiPolygon' ? data.geometry.coordinates : [data.geometry.coordinates];
          
          return (
            <g key={code}>
              {polygons.map((polygon: any, i: number) => {
                const pts = polygon[0].map((pt: number[]) => latLngToSvg(pt[1], pt[0], VBW, VBH));
                const d = pts.map(([x, y]: number[], idx: number) => `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') + ' Z';
                return (
                  <path key={i} d={d} fill="hsl(var(--foreground) / 0.05)" stroke="hsl(var(--foreground) / 0.1)" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
                );
              })}
            </g>
          );
        })}

        {Array.from(countryClassification.active).map(code => {
          const data = COUNTRY_DATA[code];
          if (!data || !data.geometry) return null;

          let polygons = data.geometry.type === 'MultiPolygon' ? data.geometry.coordinates : [data.geometry.coordinates];

          return (
            <g key={code}>
              {polygons.map((polygon: any, i: number) => {
                const pts = polygon[0].map((pt: number[]) => latLngToSvg(pt[1], pt[0], VBW, VBH));
                const d = pts.map(([x, y]: number[], idx: number) => `${idx === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ') + ' Z';
                return (
                  <path key={i} d={d} fill="hsl(var(--secondary) / 0.3)" stroke="hsl(var(--secondary) / 0.6)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" className="transition-all duration-1000" />
                );
              })}
              <text x={latLngToSvg(data.center[0], data.center[1], VBW, VBH)[0]} y={latLngToSvg(data.center[0], data.center[1], VBW, VBH)[1]} fontSize="1.2" fill="hsl(var(--secondary) / 0.8)" fontWeight="900" textAnchor="middle" className="uppercase tracking-[0.2em] pointer-events-none" style={{ fontSize: 'min(1.4px, 1.4%)' }}>{data.label}</text>
            </g>
          );
        })}

        {arrowElements && (
          <g filter="url(#glow-fx)">
            <path d={arrowElements.line} stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" fill="none" strokeLinecap="round" opacity="0.9" />
            <polygon points={arrowElements.head} fill={color} />
          </g>
        )}

        {/* Origin Node */}
        {p1 && (
          <g>
            <circle cx={p1[0]} cy={p1[1]} r="2" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="0.5 0.5" opacity="0.4" />
            <circle cx={p1[0]} cy={p1[1]} r="0.8" fill="currentColor" />
          </g>
        )}

        {/* Target Node with Logo */}
        {p2 && (
          <g>
            <circle cx={p2[0]} cy={p2[1]} r="2" fill="#000" stroke={color} strokeWidth="0.4" />
            {logoUrl ? (
              <image href={logoUrl} x={p2[0] - 1.2} y={p2[1] - 1.2} width="2.4" height="2.4" />
            ) : (
              <circle cx={p2[0]} cy={p2[1]} r="0.8" fill={color} />
            )}
          </g>
        )}
      </svg>

      <div className="absolute top-4 left-6 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-secondary/40 rounded-full animate-pulse" />
          <span className="text-[7px] font-black text-primary/40 uppercase tracking-[0.4em]">Cartographic Node v5.1</span>
        </div>
      </div>

      <div className="absolute bottom-6 left-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Geospatial Intelligence Hub</span>
        </div>
        <span className="text-sm font-black text-primary uppercase tracking-tighter ml-4">{playerName}</span>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05]">
        <div className="w-full h-[1px] bg-secondary absolute top-[15%] left-0" />
        <div className="w-full h-[1px] bg-secondary absolute top-[85%] left-0" />
      </div>
    </div>
  )
}
