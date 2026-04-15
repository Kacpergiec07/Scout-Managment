"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trophy, Star, Calendar, Users } from "lucide-react";
import { getStandingsAction, getMatchesAction, getTeamDetailsAction } from "@/app/actions/statorium";
import { StatoriumStanding, StatoriumMatch, StatoriumTeamDetail } from "@/lib/statorium/types";
import Link from "next/link";

export default function ChampionsLeaguePage() {
  const seasonId = "6"; // Placeholder for Champions League
  const [standings, setStandings] = useState<StatoriumStanding[]>([]);
  const [matches, setMatches] = useState<StatoriumMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<StatoriumTeamDetail | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, m] = await Promise.all([
          getStandingsAction(seasonId),
          getMatchesAction(seasonId)
        ]);
        setStandings(s);
        setMatches(m);
      } catch (err) {
        console.error("CL Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSelectTeam = async (id: string) => {
    const data = await getTeamDetailsAction(id);
    setSelectedTeam(data);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="flex items-center gap-6 p-8 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-black border border-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full" />
        <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-500/30">
          <Star className="w-10 h-10 text-white fill-current" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Champions League <span className="text-blue-400">Hub</span></h1>
          <p className="text-blue-200/50 font-medium">Monitoring the pinnacle of European football intelligence.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Dynamic Match Center */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {loading ? Array(4).fill(0).map((_, i) => (
               <div key={i} className="h-40 bg-white/5 rounded-2xl animate-pulse" />
             )) : matches.map((match, i) => (
               <Card key={match.matchID || i} className="bg-zinc-900/50 border-white/5 hover:border-blue-500/30 transition-all">
                 <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-6">
                       <Badge className="bg-blue-500/20 text-blue-400 border-none text-[10px]">Group Stage</Badge>
                       <span className="text-[10px] font-mono text-white/30">{match.matchDate}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                       <button onClick={() => match.homeTeam?.teamID && handleSelectTeam(match.homeTeam.teamID)} className="flex-1 text-center hover:scale-105 transition-transform">
                          <div className="w-12 h-12 bg-white/5 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-black">{match.homeTeam?.teamName?.[0]}</div>
                          <div className="text-xs font-bold truncate">{match.homeTeam?.teamName}</div>
                       </button>
                       <div className="text-lg font-black text-white/20 italic">VS</div>
                       <button onClick={() => match.awayTeam?.teamID && handleSelectTeam(match.awayTeam.teamID)} className="flex-1 text-center hover:scale-105 transition-transform">
                          <div className="w-12 h-12 bg-white/5 rounded-full mx-auto mb-2 flex items-center justify-center text-xs font-black">{match.awayTeam?.teamName?.[0]}</div>
                          <div className="text-xs font-bold truncate">{match.awayTeam?.teamName}</div>
                       </button>
                    </div>
                 </CardContent>
               </Card>
             ))}
          </div>

          <Card className="border-white/5 bg-black/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-400" />
                Champions League Standings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <table className="w-full text-sm">
                 <thead className="bg-white/5">
                   <tr className="text-left text-white/30 text-[10px] uppercase font-black">
                     <th className="px-6 py-3">Rank</th>
                     <th className="px-6 py-3">Club</th>
                     <th className="px-6 py-3 text-center">PTS</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {standings.map((row) => (
                     <tr key={row.teamID} className="hover:bg-blue-500/5 cursor-pointer transition-colors" onClick={() => handleSelectTeam(row.teamID)}>
                       <td className="px-6 py-4 font-mono">{row.rank}</td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center p-1 border border-white/10">
                                {row.teamLogo && <img src={row.teamLogo} alt="" className="object-contain w-full h-full" />}
                             </div>
                             <span className="font-bold">{row.teamName}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-center font-black text-blue-400">{row.points}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </CardContent>
          </Card>
        </div>

        {/* Squad Sidebar */}
        <div className="lg:col-span-4">
           {selectedTeam ? (
             <Card className="sticky top-6 border-blue-500/30 bg-blue-950/20 backdrop-blur-xl">
                <CardHeader className="text-center">
                   <div className="w-20 h-20 bg-white/5 rounded-3xl mx-auto mb-4 flex items-center justify-center p-3 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                     {selectedTeam.teamLogo ? (
                        <img src={selectedTeam.teamLogo} alt="" className="object-contain w-full h-full" />
                     ) : (
                        <div className="text-2xl font-black text-blue-400">{selectedTeam.teamID}</div>
                     )}
                   </div>
                   <CardTitle className="text-2xl font-black text-white tracking-tighter">{selectedTeam.teamName}</CardTitle>
                   <p className="text-xs text-blue-300/40">{selectedTeam.city} &bull; {selectedTeam.venueName}</p>
                </CardHeader>
                <CardContent>
                   <p className="text-[10px] uppercase font-black text-blue-400 mb-4 tracking-widest">Champions Roster</p>
                   <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {selectedTeam.players?.map(p => (
                           <Link href={`/analysis?id=${p.playerID}&name=${encodeURIComponent(p.fullName)}`} key={p.playerID} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-blue-500/20 transition-all group">
                              <span className="text-sm text-white/80 group-hover:text-white">{p.fullName}</span>
                              <Badge className="bg-blue-500/10 text-blue-300 border-none text-[9px] uppercase">{p.position}</Badge>
                           </Link>
                        ))}
                      </div>
                   </ScrollArea>
                </CardContent>
             </Card>
           ) : (
             <div className="border-2 border-dashed border-white/5 rounded-3xl p-12 text-center text-white/10 uppercase font-black tracking-tighter sticky top-6">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-5" />
                Select Team to Inspect
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
