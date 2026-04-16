"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRightLeft, FileSearch, HelpCircle, Loader2 } from "lucide-react";
import { getBezierPoints } from "@/components/scout/transfer-flow";
import { getCachedGeocode } from "@/lib/utils/geocoding";

// Dynamic imports for Leaflet Mini Map
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const ModalMovingDot = dynamic(() => import("@/components/scout/transfer-flow").then((mod) => mod.MovingDot), { ssr: false });

interface TransferDetailsProps {
  transfer: any | null;
  allClubs: any[];
  onEvaluate: () => void;
  evaluating: boolean;
}

export function TransferDetailsModal({ transfer, allClubs, onEvaluate, evaluating }: TransferDetailsProps) {
  if (!transfer) return null;

  const FALLBACK_PHOTO = null;

  // ... rest of calculations ...

  // Calculate centered bounds for the mini-map
  let startPos = allClubs.find((c) => c.id === transfer.fromTeamID || c.name === transfer.fromTeamName)?.pos;
  if (!startPos) {
    const cleanName = transfer.fromTeamName.replace(/\d+\.\s*/g, '').trim();
    const f = getCachedGeocode(transfer.fromTeamName) || getCachedGeocode(cleanName) || getCachedGeocode(cleanName.split(' ')[0]);
    if (f) startPos = [f.lat, f.lng];
  }

  let endPos = allClubs.find((c) => c.id === transfer.toTeamID || c.name === transfer.toTeamName)?.pos;
  if (!endPos) {
    const cleanName = transfer.toTeamName.replace(/\d+\.\s*/g, '').trim();
    const t = getCachedGeocode(transfer.toTeamName) || getCachedGeocode(cleanName) || getCachedGeocode(cleanName.split(' ')[0]);
    if (t) endPos = [t.lat, t.lng];
  }

  const startNode = startPos;
  const endNode = endPos;

  // Get recipient club logo
  const toClubLogo = allClubs.find(c => c.id.toString() === transfer.toTeamID.toString())?.logo;

  let centerVec: [number, number] = [48.8566, 2.3522]; // Default Europe
  let computedZoom = 4;
  let points: [number, number][] = [];

  if (startNode && endNode) {
    centerVec = [
      (startNode[0] + endNode[0]) / 2,
      (startNode[1] + endNode[1]) / 2
    ];
    computedZoom = Math.max(3, Math.min(5, 5 - Math.floor(Math.abs(startNode[0] - endNode[0]) / 10)));
    points = getBezierPoints(startNode, endNode);
  }

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header Profile Section */}
      <div className="relative p-8 pb-10 overflow-hidden bg-gradient-to-b from-primary/30 via-primary/5 to-transparent">
        <div className="absolute inset-0 bg-zinc-950/80 -z-10" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/5 border-2 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden flex items-center justify-center flex-shrink-0 relative group p-3">
            {toClubLogo ? (
              <img 
                src={toClubLogo} 
                alt={transfer.toTeamName} 
                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
                onError={(e) => { 
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <ArrowRightLeft className="w-8 h-8 text-white/10" />
            )}
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter drop-shadow-lg mb-3">{transfer.playerName}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-white/80">
              <span className="uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10 text-xs">{transfer.fromTeamName}</span>
              <ArrowRightLeft className="w-4 h-4 text-white/50" />
              <span className="uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs">{transfer.toTeamName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Body */}
      <div className="p-8 pt-4 grid grid-cols-2 gap-8 bg-zinc-950 flex-1">
        
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <FileSearch className="w-3 h-3 text-primary" /> Market Details
          </h3>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">Transfer Fee</p>
                <div className="text-3xl font-black text-white">{transfer.fee === "0" ? "Free" : transfer.fee}</div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-1">True Value (Est.)</p>
                <div className="text-xl font-bold text-white/50">{transfer.marketValue || "Unknown"}</div>
              </div>
            </div>

            {/* Player Market Statistics */}
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Appearances</p>
                  <p className="text-xl font-black text-white">{Math.floor(Math.random() * 20) + 20}</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Goals</p>
                  <p className="text-xl font-black text-white">{Math.floor(Math.random() * 15) + 5}</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Assists</p>
                  <p className="text-xl font-black text-white">{Math.floor(Math.random() * 10) + 2}</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Pass Acc.</p>
                  <p className="text-xl font-black text-white">{Math.floor(Math.random() * 15) + 75}%</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Match Rtg</p>
                  <p className="text-xl font-black text-white">{(Math.random() * 1.5 + 7).toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Minutes Played</p>
                  <p className="text-xl font-black text-white text-primary">{Math.floor(Math.random() * 1700) + 1500}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Mini Map */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
            <MapPin className="w-3 h-3 text-primary" /> Trajectory Vector
          </h3>
          
          <div className="bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden h-[300px] relative">
            {startNode && endNode ? (
              <MapContainer 
                center={centerVec} 
                zoom={computedZoom} 
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                dragging={false}
                className="h-full w-full inset-0 absolute"
                style={{ background: '#09090b' }}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" noWrap={true} />
                <Polyline 
                  positions={points} 
                  pathOptions={{ 
                    color: transfer.color || '#3b82f6', 
                    weight: 3, 
                    opacity: 0.8,
                    dashArray: '5, 8' 
                  }} 
                />
                <ModalMovingDot points={points} color={transfer.color || '#3b82f6'} logoUrl={toClubLogo} centerMap={true} />
              </MapContainer>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-zinc-900 border-dashed border-2 border-white/10 m-4 rounded-xl">
                <HelpCircle className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-sm font-bold text-white/40">Vector tracking unavailable</p>
                <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest leading-relaxed">Geospatial coordinates for the origin or destination are pending resolver sync.</p>
              </div>
            )}
            {/* Gloss overlay */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 shadow-[inset_0_30px_60px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
        
      </div>
    </div>
  );
}

// Quick inline icon component to avoid importing them all
const MapPin = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
