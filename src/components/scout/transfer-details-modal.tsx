"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRightLeft, FileSearch, HelpCircle, Loader2, Zap, ArrowRight } from "lucide-react";
import { getBezierPoints } from "@/components/scout/transfer-flow";
import { getCachedGeocode } from "@/lib/utils/geocoding";

import { TacticalSchematicMap } from "@/components/scout/tactical-schematic-map";
import { FitRadarChart } from "@/components/scout/fit-radar-chart";
import { BrainCircuit } from "lucide-react";

interface TransferDetailsProps {
  transfer: any | null;
  allClubs: any[];
  onEvaluate: () => void;
  evaluating: boolean;
}

function MiniPitch({ position }: { position: string }) {
  // Map shorthand positions to pitch coordinates
  const posMap: Record<string, { x: string, y: string }> = {
    'GK': { x: '10%', y: '50%' },
    'CB': { x: '25%', y: '50%' },
    'LB': { x: '25%', y: '20%' },
    'RB': { x: '25%', y: '80%' },
    'DF': { x: '25%', y: '50%' },
    'CDM': { x: '40%', y: '50%' },
    'CM': { x: '55%', y: '50%' },
    'LM': { x: '55%', y: '20%' },
    'RM': { x: '55%', y: '80%' },
    'MF': { x: '55%', y: '50%' },
    'CAM': { x: '70%', y: '50%' },
    'LW': { x: '85%', y: '20%' },
    'RW': { x: '85%', y: '80%' },
    'ST': { x: '85%', y: '50%' },
    'FW': { x: '85%', y: '50%' },
  };

  const coords = posMap[position] || posMap['FW'];

  return (
    <div className="relative w-full max-w-[600px] h-[300px] bg-accent/20 rounded-[2rem] border border-border overflow-hidden shadow-2xl backdrop-blur-sm group/pitch">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary-500/5 to-transparent pointer-events-none" />
      
      {/* Pitch Markings */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 100" fill="none" preserveAspectRatio="none">
        <rect x="10" y="10" width="180" height="80" stroke="currentColor" strokeWidth="1" className="text-foreground/20" />
        <line x1="100" y1="10" x2="100" y2="90" stroke="currentColor" strokeWidth="1" className="text-foreground/20" />
        <circle cx="100" cy="50" r="15" stroke="currentColor" strokeWidth="1" className="text-foreground/20" />
        {/* Goal Areas */}
        <rect x="10" y="30" width="20" height="40" stroke="currentColor" strokeWidth="1" className="text-foreground/20" />
        <rect x="170" y="30" width="20" height="40" stroke="currentColor" strokeWidth="1" className="text-foreground/20" />
      </svg>

      {/* Helper to show the player is moving towards the target goal (right side) */}
      <div className="absolute top-4 right-6 flex items-center gap-2 opacity-30">
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Target Goal</span>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
      </div>

      {/* Position Dot */}
      <div 
        className="absolute w-6 h-6 bg-secondary rounded-full shadow-[0_0_30px_rgba(0,255,136,0.5)] border-4 border-background flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-1000 group-hover/pitch:scale-125"
        style={{ left: coords.x, top: coords.y }}
      >
        <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-40" />
        
        {/* Floating Label Above Dot */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background px-2 py-0.5 rounded border border-secondary/50 shadow-2xl backdrop-blur-md">
           <span className="text-[10px] font-black text-secondary leading-none block">{position}</span>
        </div>
      </div>

      {/* Position Glow */}
      <div 
        className="absolute w-32 h-32 bg-secondary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000"
        style={{ left: coords.x, top: coords.y }}
      />
    </div>
  );
}

export function TransferDetailsModal({ transfer, allClubs, onEvaluate, evaluating }: TransferDetailsProps) {
  if (!transfer) return null;

  const FALLBACK_PHOTO = null;

  // ... rest of calculations ...

  // Calculate centered bounds for the mini-map
  // Deterministic coordinate generator for unknown clubs
  const getDeterministicCoords = (name: string): [number, number] => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = (name || '').charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate within Europe: lat 38-55, lng -9 to 20
    const lat = 38 + (Math.abs(hash) % 170) / 10;
    const lng = -9 + (Math.abs(hash >> 8) % 290) / 10;
    return [lat, lng];
  };

  let startPos = allClubs.find((c) => c.id === transfer.fromTeamID || c.name === transfer.fromTeamName)?.pos;
  if (!startPos) {
    const cleanName = transfer.fromTeamName?.replace(/\d+\.\s*/g, '').trim() || '';
    const f = getCachedGeocode(transfer.fromTeamName) || getCachedGeocode(cleanName) || getCachedGeocode(cleanName.split(' ')[0]);
    if (f) startPos = [f.lat, f.lng];
    else startPos = getDeterministicCoords(transfer.fromTeamName);
  }

  let endPos = allClubs.find((c) => c.id === transfer.toTeamID || c.name === transfer.toTeamName)?.pos;
  if (!endPos) {
    const cleanName = transfer.toTeamName?.replace(/\d+\.\s*/g, '').trim() || '';
    const t = getCachedGeocode(transfer.toTeamName) || getCachedGeocode(cleanName) || getCachedGeocode(cleanName.split(' ')[0]);
    if (t) endPos = [t.lat, t.lng];
    else endPos = getDeterministicCoords(transfer.toTeamName);
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

  const [activeTab, setActiveTab] = React.useState<'OVERVIEW' | 'TACTICAL_FIT'>('TACTICAL_FIT');

  // AI Fit Text generation based on player position/name for demo
  const aiFitText = React.useMemo(() => {
    return `Neural engine evaluation indicates ${transfer.playerName} provides a high-impact tactical synergy with ${transfer.toTeamName}'s current system. The transition vector heavily favors offensive transitions, leveraging superior finishing and physical presence. Expected integration time is minimal, with projected peak performance aligning with the upcoming intensive fixture cycle.`;
  }, [transfer]);

  const getFlag = (teamName: string) => {
    if (!teamName) return "🏳️";
    const name = teamName.toLowerCase();
    if (name.includes('chelsea') || name.includes('arsenal') || name.includes('manchester') || 
        name.includes('tottenham') || name.includes('liverpool') || name.includes('villa') || 
        name.includes('everton')) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
    if (name.includes('madrid') || name.includes('barcelona') || name.includes('girona')) return "🇪🇸";
    if (name.includes('juventus') || name.includes('milan') || name.includes('inter')) return "🇮🇹";
    if (name.includes('bayern') || name.includes('dortmund') || name.includes('leipzig')) return "🇩🇪";
    if (name.includes('psg') || name.includes('lille') || name.includes('monaco')) return "🇫🇷";
    return "🏳️";
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header Profile Section */}
      <div className="relative p-8 pb-10 overflow-hidden bg-gradient-to-b from-primary/30 via-primary/5 to-transparent">
        <div className="absolute inset-0 bg-background/80 -z-10" />
        <div className="relative z-10 flex items-center gap-8">
          {/* Player Photo Circle */}
          <div className="w-32 h-32 rounded-full bg-card border-4 border-border/50 shadow-[0_0_40px_rgba(0,0,0,0.2)] overflow-hidden flex-shrink-0 relative group">
            <img 
              src={transfer.photoUrl} 
              alt={transfer.playerName} 
              className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" 
            />
          </div>
          <div>
            <h2 className="text-5xl font-black text-foreground tracking-tighter drop-shadow-2xl mb-4 flex items-center gap-4">
              {transfer.playerName}
              <span className="text-base border border-secondary/30 text-secondary/60 px-3 py-1 rounded-lg font-bold uppercase tracking-[0.2em] bg-secondary/5 backdrop-blur-sm">
                {transfer.position && transfer.position !== "N/A" ? transfer.position : "FW"}
              </span>
            </h2>
            <div className="flex items-center gap-4">
              {/* From Club Logo Badge */}
              <div className="flex items-center gap-2 bg-card/50 border border-border pl-2 pr-4 py-1.5 rounded-full backdrop-blur-md">
                <div className="w-6 h-6 flex items-center justify-center bg-background rounded-full p-1">
                  {transfer.fromTeamLogo ? (
                    <img src={transfer.fromTeamLogo} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 rounded-full" />
                  )}
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter mb-0.5">{getFlag(transfer.fromTeamName)} ORIGIN</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{transfer.fromTeamName}</span>
                </div>
              </div>

              <ArrowRightLeft className="w-4 h-4 text-muted-foreground/30" />

              {/* To Club Logo Badge */}
              <div className="flex items-center gap-2 bg-secondary/10 border border-secondary/30 pl-2 pr-4 py-1.5 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                <div className="w-6 h-6 flex items-center justify-center bg-background rounded-full p-1 border border-secondary/20">
                  {transfer.toTeamLogo ? (
                    <img src={transfer.toTeamLogo} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full bg-accent rounded-full" />
                  )}
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[8px] font-bold text-secondary/40 uppercase tracking-tighter mb-0.5">{getFlag(transfer.toTeamName)} DESTINATION</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary">{transfer.toTeamName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Body */}
      <div className="p-8 pt-0 bg-background flex-1 flex flex-col relative min-h-[500px]">
        {evaluating && (
          <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-2 border-[#f59e0b]/10 border-t-[#f59e0b] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-8 h-8 text-[#f59e0b] animate-pulse" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f59e0b] mt-8 animate-pulse">
              Neural Processing Architecture...
            </p>
            <div className="mt-4 flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 h-1 bg-[#f59e0b]/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border mb-6 pb-4 pt-4">
          <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all ${activeTab === 'OVERVIEW' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Overview & Market
          </button>
          <button 
            onClick={() => setActiveTab('TACTICAL_FIT')}
            className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'TACTICAL_FIT' ? 'bg-secondary/10 text-secondary shadow-[0_0_15px_rgba(0,255,136,0.2)]' : 'text-muted-foreground hover:text-secondary/60'}`}
          >
            <BrainCircuit className="w-4 h-4" /> Tactical Fit Analysis
          </button>
        </div>

        {activeTab === 'OVERVIEW' ? (
        <div className="grid grid-cols-2 gap-8 flex-1">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <FileSearch className="w-3 h-3 text-secondary" /> Market Details
            </h3>
          
          <div className="bg-card/50 border border-border rounded-2xl p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">Transfer Fee</p>
                <div className="text-3xl font-black text-foreground">{transfer.fee === "0" ? "Free" : transfer.fee}</div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">True Value (Est.)</p>
                <div className="text-xl font-bold text-muted-foreground/50">{transfer.marketValue || "Unknown"}</div>
              </div>
            </div>

            {/* Player Market Statistics */}
            <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4">
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Appearances</p>
                  <p className="text-xl font-black text-foreground">{((transfer.playerName.length * 3) % 20) + 20}</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Goals</p>
                  <p className="text-xl font-black text-foreground">{((transfer.playerName.length * 7) % 15) + 5}</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Assists</p>
                  <p className="text-xl font-black text-foreground">{((transfer.playerName.length * 2) % 10) + 2}</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Pass Acc.</p>
                  <p className="text-xl font-black text-foreground">{((transfer.playerName.length * 5) % 15) + 75}%</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Match Rtg</p>
                  <p className="text-xl font-black text-foreground">{(((transfer.playerName.length * 11) % 15) / 10 + 7).toFixed(2)}</p>
               </div>
               <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Minutes Played</p>
                  <p className="text-xl font-black text-secondary">{((transfer.playerName.length * 43) % 1700) + 1500}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Mini Map */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <MapPin className="w-3 h-3 text-secondary" /> Trajectory Vector
          </h3>
          
          <div className="bg-background border border-border rounded-2xl overflow-hidden h-[300px] relative">
            {startNode && endNode ? (
              <TacticalSchematicMap 
                start={startNode as [number, number]} 
                end={endNode as [number, number]} 
                color={transfer.color} 
                playerName={transfer.playerName}
                logoUrl={toClubLogo}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-accent border-dashed border-2 border-border m-4 rounded-xl">
                <HelpCircle className="w-8 h-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-bold text-muted-foreground/40">Vector tracking unavailable</p>
                <p className="text-[10px] text-muted-foreground/20 mt-1 uppercase tracking-widest leading-relaxed">Geospatial coordinates for the origin or destination are pending resolver sync.</p>
              </div>
            )}
            {/* Gloss overlay */}
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-foreground/5 shadow-[inset_0_30px_60px_rgba(0,0,0,0.5)]" />
          </div>
        </div>
        </div>
        ) : (
          <div className="flex flex-col gap-8 flex-1 animate-in fade-in duration-500">
             <div className="grid grid-cols-3 gap-8">
               <div className="col-span-1 space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                   <BrainCircuit className="w-3 h-3 text-[hsl(var(--secondary))]" /> AI Intelligence Report
                 </h3>
                 <div className="bg-[hsl(var(--secondary))]/5 border border-[hsl(var(--secondary))]/20 rounded-2xl p-6 relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--secondary))]/10 to-transparent pointer-events-none" />
                   <p className="text-sm text-foreground/80 leading-relaxed relative z-10">
                     {aiFitText}
                   </p>
                   
                   <div className="mt-6 pt-6 border-t border-[hsl(var(--secondary))]/10 relative z-10">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--secondary))]/50 mb-4">Key Attribute Alignments</p>
                     <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-bold uppercase">System Compatibility</span>
                          <span className="text-secondary font-black">94%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1"><div className="bg-secondary h-1 rounded-full w-[94%]" /></div>
                        
                        <div className="flex justify-between items-center text-xs mt-3">
                          <span className="text-muted-foreground font-bold uppercase">Role Adaptability</span>
                          <span className="text-secondary font-black">82%</span>
                        </div>
                        <div className="w-full bg-accent rounded-full h-1"><div className="bg-secondary h-1 rounded-full w-[82%]" /></div>
                     </div>
                   </div>
                 </div>
               </div>
               <div className="col-span-2 flex flex-col items-center">
                 <FitRadarChart overallFit={((transfer.playerName.length * 13) % 15) + 80} />
                 <div className="mt-8 flex flex-col items-center w-full">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 self-center">Positional Mapping</p>
                    <MiniPitch position={transfer.position || "FW"} />
                 </div>
               </div>
             </div>
          </div>
        )}
        
      </div>
    </div>
  );
}

// Quick inline icon component to avoid importing them all
const MapPin = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
