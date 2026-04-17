"use client";

import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCircle, Trash2, ArrowRightLeft, Users, ChevronRight } from "lucide-react";
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
    <div className="relative w-full aspect-[3/4] bg-emerald-950/20 border-2 border-emerald-500/20 rounded-2xl overflow-hidden p-6 shadow-[inset_0_0_50px_rgba(16,185,129,0.1)]">
      {/* Pitch markings */}
      <div className="absolute inset-0 opacity-20" style={{ 
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19%, rgba(16, 185, 129, 0.2) 20%)',
        backgroundSize: '100% 20%' 
      }} />
      <div className="absolute inset-x-6 top-0 h-28 border-b border-l border-r border-white/10" />
      <div className="absolute inset-x-6 bottom-0 h-28 border-t border-l border-r border-white/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-white/10" />
      <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />

      {/* Player Nodes */}
      <div className="absolute inset-0 flex flex-col justify-between py-12 px-2">
        {/* Attack */}
        <div className="flex justify-around">
          {Array.from({ length: formationLayout.f }).map((_, i) => (
            <PlayerDot key={`fw-${i}`} player={fws[i]} pos="FW" subs={subs} />
          ))}
        </div>
        {/* Midfield */}
        <div className="flex justify-around">
          {Array.from({ length: formationLayout.m }).map((_, i) => (
            <PlayerDot key={`mf-${i}`} player={mfs[i]} pos="MF" subs={subs} />
          ))}
        </div>
        {/* Defense */}
        <div className="flex justify-around">
          {Array.from({ length: formationLayout.d }).map((_, i) => (
            <PlayerDot key={`df-${i}`} player={dfs[i]} pos="DF" subs={subs} />
          ))}
        </div>
        {/* Goalkeeper */}
        <div className="flex justify-center">
          <PlayerDot player={gks[0] || startingXI[0]} pulse pos="GK" subs={subs} />
        </div>
      </div>
    </div>
  );
}

function PlayerDot({ player, pulse, pos, subs }: { player?: any, pulse?: boolean, pos: string, subs: any[] }) {
  const depth = useMemo(() => {
    return subs.filter(s => isPos(s, pos, pos === 'GK' ? 'Goalkeep' : pos === 'DF' ? 'Def' : pos === 'MF' ? 'Mid' : 'Atac'));
  }, [subs, pos]);

  if (!player) return <div className="w-4 h-4 rounded-full bg-white/10" />;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative group/node flex flex-col items-center cursor-pointer">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-background border border-white/10 text-[8px] font-bold rounded opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap z-10">
            {player.fullName}
          </div>
          <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-transform hover:scale-125 relative z-10 border-2 border-black`}>
            {pulse && <div className="absolute -inset-2 rounded-full border-2 border-primary animate-ping opacity-30" />}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-black/90 backdrop-blur-xl border-white/10 p-0 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              {player.photo ? (
                 <img src={player.photo} alt={player.fullName} className="w-full h-full object-cover rounded-full" />
              ) : <UserCircle className="w-6 h-6 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{player.fullName}</p>
              <Badge variant="outline" className="text-[10px] h-4 bg-primary/20 border-primary/50 text-primary uppercase">{pos}</Badge>
            </div>
          </div>
          <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-2 px-1">Main Choice • Starting XI</p>
        </div>
        
        <div className="p-2">
          <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2 px-2 flex items-center gap-2">
            <ArrowRightLeft className="w-3 h-3 text-primary" />
            Squad Depth / Replacements
          </p>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1 p-1">
              {depth.length > 0 ? depth.map((sub) => (
                <Link
                  href={`/compare?p1=${player.playerID}&p2=${sub.playerID}`}
                  key={sub.playerID}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group border border-transparent hover:border-primary/30 transition-all cursor-pointer"
                  title={`Compare ${player.fullName} vs ${sub.fullName}`}
                >
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="w-3 h-3 text-white/20 group-hover:text-primary transition-colors" />
                    <UserCircle className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                    <span className="text-xs text-white/70 group-hover:text-white transition-colors">{sub.fullName}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-primary transition-all opacity-0 group-hover:opacity-100" />
                </Link>
              )) : (
                <div className="p-4 text-center text-[10px] text-white/20 italic">No alternative {pos} found in bench.</div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function isPos(p: any, short: string, long: string) {
  const pos = p.position || p.additionalInfo?.position || '';
  return pos.toLowerCase().startsWith(short.toLowerCase()) || pos.toLowerCase().startsWith(long.toLowerCase());
}
