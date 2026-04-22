const fs = require('fs');
const path = 'app/(dashboard)/leagues/[id]/league-details-client.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = /function PlayerDot\(\{ player \}: \{ player: any \}\) \{([\s\S]*?)\}/;
const replacement = `function PlayerDot({ player, subs }: { player: any, subs: any[] }) {
   const sub = subs?.find((s: any) => String(s.playerOUT) === String(player.playerID));
   
   return (
      <div className="flex flex-col items-center gap-1 group/player relative">
         {/* Sub Indicator */}
         {sub && (
            <div className="absolute -top-1 -right-1 z-10 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg border border-black animate-pulse">
               <ArrowRightLeft className="w-2.5 h-2.5 text-black" />
            </div>
         )}

         {/* Tooltip */}
         {sub && (
            <div className="absolute bottom-full mb-2 opacity-0 group-hover/player:opacity-100 pointer-events-none transition-all duration-300 z-50">
               <div className="bg-black/90 border border-white/10 p-2 rounded-xl backdrop-blur-xl shadow-2xl whitespace-nowrap">
                  <div className="flex items-center gap-2">
                     <div className="p-1 bg-yellow-500/10 rounded-lg">
                        <ArrowRightLeft className="w-3 h-3 text-yellow-500" />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Replaced by</span>
                        <span className="text-[10px] font-black text-white uppercase tracking-tight">{sub.playerINFullName || sub.playerIN}</span>
                     </div>
                  </div>
               </div>
               <div className="w-2 h-2 bg-black/90 border-r border-b border-white/10 rotate-45 mx-auto -mt-1" />
            </div>
         )}

         <div className={\`w-10 h-10 rounded-full bg-black border-2 \${sub ? 'border-yellow-500/50 ring-yellow-500/20' : 'border-emerald-500/50 ring-emerald-500/20'} flex items-center justify-center overflow-hidden shadow-lg group-hover/player:scale-110 transition-transform cursor-help ring-2\`}>
            {player.playerPhoto ? (
               <img src={player.playerPhoto} alt="" className="w-full h-full object-cover" />
            ) : (
               <UserCircle className={\`w-6 h-6 \${sub ? 'text-yellow-500/30' : 'text-emerald-500/30'}\`} />
            )}
         </div>
         <span className="text-[8px] font-black text-white/80 uppercase tracking-tight text-center max-w-[60px] leading-tight truncate px-1 bg-black/40 rounded">
            {player.playerFullName?.split(' ').pop()}
         </span>
         <span className={\`text-[7px] font-bold \${sub ? 'text-yellow-500 bg-yellow-500/10' : 'text-emerald-500 bg-emerald-500/10'} px-1 rounded tabular-nums\`}>#{player.playerNumber || "??"}</span>
      </div>
   );
}`;

content = content.replace(target, replacement);

fs.writeFileSync(path, content);
console.log('Update complete');
