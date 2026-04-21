"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Player {
  playerID: string;
  fullName: string;
  photo?: string;
  playerPhoto?: string;
  position?: string;
  additionalInfo?: {
    position?: string;
  };
  country?: {
    name: string;
  } | string;
}

function getShortPos(p: any) {
  const pos = p.position || p.additionalInfo?.position || '';
  if (pos.startsWith('GK') || pos.startsWith('Goalkeep')) return 'GK';
  if (pos.startsWith('DF') || pos.startsWith('Def')) return 'DF';
  if (pos.startsWith('MF') || pos.startsWith('Mid')) return 'MF';
  if (pos.startsWith('FW') || pos.startsWith('Atac')) return 'FW';
  return 'N/A';
}

export function SquadRow({ player, starting }: { player: Player; starting?: boolean }) {
  const photoUrl = player.photo || player.playerPhoto || `https://api.statorium.com/media/bearleague/bl${player.playerID}.webp`;
  
  return (
    <Link 
      href={`/analysis?id=${player.playerID}&name=${encodeURIComponent(player.fullName)}`}
      className="flex items-center justify-between p-5 hover:bg-white/5 transition-all group relative border-l-2 border-transparent hover:border-primary/50"
    >
      <div className="flex items-center gap-4">
        {/* Photo Avatar */}
        <div className="relative w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img 
            src={photoUrl} 
            alt={player.fullName}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter absolute inset-0 flex items-center justify-center -z-10 bg-zinc-900">
            {player.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
          starting ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/10"
        }`}>
          <span className={`text-[8px] font-black ${starting ? "text-primary" : "text-white/20"}`}>{getShortPos(player)}</span>
        </div>
        <div>
          <p className="font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
            {player.fullName}
            {starting && <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />}
          </p>
          <p className="text-[10px] text-white/30 uppercase tracking-widest">
            {typeof player.country === 'object' ? player.country.name : player.country || 'N/A'}
          </p>
        </div>
      </div>
      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        Analyze
      </Badge>
    </Link>
  );
}
