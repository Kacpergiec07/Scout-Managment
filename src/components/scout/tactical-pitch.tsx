"use client";

import { useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCircle, ArrowRightLeft, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

interface TacticalPitchProps {
  startingXI: any[];
  allPlayers: any[];
  formationLayout: { d: number, m: number, f: number };
}

export function TacticalPitch({ startingXI, allPlayers, formationLayout }: TacticalPitchProps) {
  const gks = startingXI.filter(p => isPos(p, 'GK', 'Goalkeep'));
  const dfs = startingXI.filter(p => isPos(p, 'DF', 'Def'));
  const mfs = startingXI.filter(p => isPos(p, 'MF', 'Mid'));
  const fws = startingXI.filter(p => isPos(p, 'FW', 'Atac'));

  const startingIdSet = new Set(startingXI.map(p => p.playerID));
  const subs = allPlayers.filter(p => !startingIdSet.has(p.playerID));

  return (
    <div className="relative w-full aspect-[3/4] bg-[#0a2016] border-2 border-emerald-500/20 rounded-[2rem] overflow-hidden p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_100px_rgba(16,185,129,0.05)]">
      {/* Pitch markings SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="280" height="380" stroke="white" strokeWidth="2" />
        <line x1="10" y1="200" x2="290" y2="200" stroke="white" strokeWidth="2" />
        <circle cx="150" cy="200" r="40" stroke="white" strokeWidth="2" />
        <circle cx="150" cy="200" r="2" fill="white" />
        {/* Penalty areas */}
        <rect x="70" y="10" width="160" height="60" stroke="white" strokeWidth="2" />
        <rect x="70" y="330" width="160" height="60" stroke="white" strokeWidth="2" />
        {/* Goal areas */}
        <rect x="110" y="10" width="80" height="20" stroke="white" strokeWidth="2" />
        <rect x="110" y="370" width="80" height="20" stroke="white" strokeWidth="2" />
      </svg>

      {/* Player Nodes Layer */}
      <div className="absolute inset-0 flex flex-col justify-between py-14 px-4 z-10">
        {/* Attack */}
        <div className="flex justify-around items-center h-20">
          {Array.from({ length: formationLayout.f }).map((_, i) => (
            <PlayerDot key={`fw-${i}`} player={fws[i]} pos="FW" subs={subs} />
          ))}
        </div>
        {/* Midfield */}
        <div className="flex justify-around items-center h-20">
          {Array.from({ length: formationLayout.m }).map((_, i) => (
            <PlayerDot key={`mf-${i}`} player={mfs[i]} pos="MF" subs={subs} />
          ))}
        </div>
        {/* Defense */}
        <div className="flex justify-around items-center h-20">
          {Array.from({ length: formationLayout.d }).map((_, i) => (
            <PlayerDot key={`df-${i}`} player={dfs[i]} pos="DF" subs={subs} />
          ))}
        </div>
        {/* Goalkeeper */}
        <div className="flex justify-center items-center h-20">
          <PlayerDot player={gks[0] || startingXI[0]} pulse pos="GK" subs={subs} />
        </div>
      </div>

      {/* Corner Overlays */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
        <Zap className="w-3 h-3 text-primary animate-pulse" />
        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-300">Live Formation</span>
      </div>
    </div>
  );
}

function PlayerDot({ player, pulse, pos, subs }: { player?: any, pulse?: boolean, pos: string, subs: any[] }) {
  const depth = useMemo(() => {
    return subs.filter(s => isPos(s, pos, pos === 'GK' ? 'Goalkeep' : pos === 'DF' ? 'Def' : pos === 'MF' ? 'Mid' : 'Atac'));
  }, [subs, pos]);

  if (!player) return <div className="w-3 h-3 rounded-full bg-white/5 border border-white/10" />;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative group/node flex flex-col items-center cursor-pointer">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 border border-zinc-800 text-[9px] font-black text-white rounded-lg opacity-0 group-hover/node:opacity-100 transition-all transform group-hover/node:-translate-y-1 whitespace-nowrap z-20 uppercase tracking-widest shadow-2xl">
            {player.fullName}
          </div>
          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-125 relative z-10 border-2 border-zinc-900 overflow-hidden`}>
            {player.photo ? (
              <img src={player.photo} alt={player.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-black text-zinc-900">{player.fullName.split(' ').map((n:any)=>n[0]).join('')}</span>
            )}
            {pulse && <div className="absolute -inset-2 rounded-full border-2 border-primary animate-ping opacity-30" />}
          </div>
          <div className="mt-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[8px] font-black text-zinc-400 border border-white/5 group-hover/node:border-primary/30 transition-colors uppercase">
            {pos}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-zinc-950 border-zinc-800 p-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,1)] rounded-2xl">
        <div className="p-5 border-b border-zinc-800/50 bg-gradient-to-br from-zinc-900 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden shadow-xl">
              {player.photo ? (
                 <img src={player.photo} alt={player.fullName} className="w-full h-full object-cover" />
              ) : <UserCircle className="w-8 h-8 text-zinc-600" />}
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-tight italic leading-none mb-1">{player.fullName}</p>
              <div className="flex items-center gap-2">
                <Badge className="text-[9px] h-4 bg-primary/20 border-primary/30 text-primary uppercase font-black px-1.5">{pos}</Badge>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Starting XI</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3">
          <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-3 px-2 flex items-center gap-2">
            <ArrowRightLeft className="w-3 h-3 text-primary" />
            Tactical depth / Subs
          </p>
          <ScrollArea className="h-40">
            <div className="space-y-1 p-1">
              {depth.length > 0 ? depth.map((sub) => (
                <Link
                  href={`/compare?p1=${player.playerID}&p2=${sub.playerID}`}
                  key={sub.playerID}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 group border border-transparent hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
                       {sub.photo ? <img src={sub.photo} alt={sub.fullName} className="w-full h-full object-cover" /> : <UserCircle className="w-3 h-3 text-zinc-700" />}
                    </div>
                    <span className="text-[11px] text-zinc-400 group-hover:text-white transition-colors font-bold uppercase">{sub.fullName}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-zinc-700 group-hover:text-primary transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              )) : (
                <div className="p-4 text-center text-[10px] text-zinc-700 italic font-bold uppercase tracking-widest">No depth analysis available.</div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function isPos(p: any, short: string, long: string) {
  const pos = (p.position || p.additionalInfo?.position || '').toLowerCase();
  return pos.startsWith(short.toLowerCase()) || pos.startsWith(long.toLowerCase());
}
