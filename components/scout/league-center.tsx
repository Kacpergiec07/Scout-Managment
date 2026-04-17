"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trophy, Calendar, Users, ChevronRight, MapPin } from "lucide-react";
import { getStandingsAction, getMatchesAction, getTeamDetailsAction } from "@/app/actions/statorium";
import { StatoriumStanding, StatoriumMatch, StatoriumTeamDetail } from "@/lib/statorium/types";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface League {
  id: string;
  name: string;
  seasonId: string;
  flag: string;
}

const TOP_LEAGUES: League[] = [
  { id: "pl", name: "Premier League", seasonId: "515", flag: "🇬🇧" },
  { id: "laliga", name: "La Liga", seasonId: "558", flag: "🇪🇸" },
  { id: "seriea", name: "Serie A", seasonId: "511", flag: "🇮🇹" },
  { id: "bundesliga", name: "Bundesliga", seasonId: "521", flag: "🇩🇪" },
  { id: "ligue1", name: "Ligue 1", seasonId: "519", flag: "🇫🇷" },
];

export function LeagueCenter() {
  const [activeLeague, setActiveLeague] = useState(TOP_LEAGUES[0]);
  const [standings, setStandings] = useState<StatoriumStanding[]>([]);
  const [matches, setMatches] = useState<StatoriumMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<StatoriumTeamDetail | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sId = searchParams.get('sId');
    if (sId) {
      const found = TOP_LEAGUES.find(l => l.seasonId === sId);
      if (found) {
        setActiveLeague(found);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [standingsData, matchesData] = await Promise.all([
        getStandingsAction(activeLeague.seasonId),
        getMatchesAction(activeLeague.seasonId)
      ]);
      setStandings(standingsData);
      setMatches(matchesData);
      setLoading(false);
    }
    loadData();
  }, [activeLeague]);

  const handleViewTeam = async (teamId: string) => {
    setLoadingTeam(true);
    const team = await getTeamDetailsAction(teamId, activeLeague.seasonId);
    setSelectedTeam(team);
    setLoadingTeam(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">League Intelligence</h2>
            <p className="text-white/50 text-sm">Real-time standings, fixtures, and squad analysis.</p>
          </div>
        </div>

        <div className="flex flex-wrap p-1 bg-white/5 rounded-xl border border-white/10 gap-1">
          {TOP_LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setActiveLeague(league)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeLeague.id === league.id 
                ? "bg-primary text-primary-foreground shadow-lg" 
                : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="mr-2">{league.flag}</span>
              {league.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Standings Table */}
        <Card className="lg:col-span-2 border-white/10 bg-black/40 backdrop-blur-xl transition-all hover:bg-black/50 overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                {activeLeague.name} Standings
              </CardTitle>
              <CardDescription className="text-xs text-white/30">Season 2025/26</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 text-white/40 border-b border-white/10">
                    <th className="px-6 py-3 text-left w-12 text-xs font-black">#</th>
                    <th className="px-6 py-3 text-left text-xs font-black">TEAM</th>
                    <th className="px-6 py-3 text-center text-xs font-black">P</th>
                    <th className="px-6 py-3 text-center text-xs font-black">W</th>
                    <th className="px-6 py-3 text-center text-xs font-black">D</th>
                    <th className="px-6 py-3 text-center text-xs font-black">L</th>
                    <th className="px-6 py-3 text-center text-xs font-black">GD</th>
                    <th className="px-6 py-3 text-center text-xs font-black">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(standings.length > 0 ? standings : Array(10).fill({})).map((row, idx) => (
                    <tr 
                      key={row.teamID || idx} 
                      className={`group hover:bg-white/5 transition-colors cursor-pointer border-l-2 ${
                        (row.rank || idx + 1) <= 5 ? "border-blue-500/50" : 
                        (row.rank || idx + 1) === 6 ? "border-orange-500/50" : 
                        (row.rank || idx + 1) === 7 ? "border-emerald-500/50" : 
                        "border-transparent"
                      }`}
                      onClick={() => row.teamID && handleViewTeam(row.teamID)}
                    >
                      <td className="px-6 py-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`${
                            (row.rank || idx + 1) <= 5 ? "text-blue-400 font-bold" : 
                            (row.rank || idx + 1) === 6 ? "text-orange-400" : 
                            (row.rank || idx + 1) === 7 ? "text-emerald-400" : 
                            "text-white/20"
                          }`}>
                            {row.rank || idx + 1}
                          </span>
                          {(row.rank || idx + 1) <= 5 && <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_5px_rgba(59,130,246,0.5)]" title="Champions League" />}
                          {(row.rank || idx + 1) === 6 && <div className="w-1 h-1 rounded-full bg-orange-400 shadow-[0_0_5px_rgba(249,115,22,0.5)]" title="Europa League" />}
                          {(row.rank || idx + 1) === 7 && <div className="w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.5)]" title="Conference League" />}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center p-1 overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all">
                            {row.teamLogo ? (
                              <img src={row.teamLogo} alt={row.teamName} className="object-contain w-full h-full" />
                            ) : (
                               <Trophy className="w-4 h-4 text-white/10" />
                            )}
                          </div>
                          <span className="font-bold text-white group-hover:text-primary transition-colors text-base">
                            {row.teamName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-white/60">{row.played || 0}</td>
                      <td className="px-6 py-4 text-center text-white/60">{row.won || 0}</td>
                      <td className="px-6 py-4 text-center text-white/60">{row.drawn || 0}</td>
                      <td className="px-6 py-4 text-center text-white/60">{row.lost || 0}</td>
                      <td className="px-6 py-4 text-center text-white/60">{row.goalsFor - row.goalsAgainst || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-primary">{row.points || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Matches & Team Detail */}
        <div className="space-y-8">
          {/* Upcoming Matches */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="bg-white/5 border-b border-white/10">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Next Fixtures
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {loading ? (
                   <div className="p-8 text-center"><Loader2 className="w-4 h-4 animate-spin inline mr-2 text-primary"/></div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {(matches.length > 0 ? matches : Array(5).fill({})).map((match, idx) => (
                      <div key={match.matchID || idx} className="p-4 hover:bg-white/5 transition-all">
                        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 flex justify-between">
                          <span>{match.matchDate || 'Upcoming Match'}</span>
                          <span>{match.matchTime || 'TBC'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 text-center space-y-2">
                            <div className="w-10 h-10 bg-white/5 rounded-xl mx-auto flex items-center justify-center p-1 border border-white/5">
                              {(match.homeParticipant?.logo || match.homeTeam?.logo) ? (
                                <img src={match.homeParticipant?.logo || match.homeTeam?.logo} className="w-full h-full object-contain" />
                              ) : <span className="text-[10px] text-white/20">H</span>}
                            </div>
                            <div className="text-xs font-bold text-white truncate max-w-[100px] mx-auto">
                              {match.homeParticipant?.participantName || match.homeTeam?.teamName || 'Home Team'}
                            </div>
                          </div>
                          <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-white/40">VS</div>
                          <div className="flex-1 text-center space-y-2">
                            <div className="w-10 h-10 bg-white/5 rounded-xl mx-auto flex items-center justify-center p-1 border border-white/5">
                              {(match.awayParticipant?.logo || match.awayTeam?.logo) ? (
                                <img src={match.awayParticipant?.logo || match.awayTeam?.logo} className="w-full h-full object-contain" />
                              ) : <span className="text-[10px] text-white/20">A</span>}
                            </div>
                            <div className="text-xs font-bold text-white truncate max-w-[100px] mx-auto">
                              {match.awayParticipant?.participantName || match.awayTeam?.teamName || 'Away Team'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Featured Squad Area */}
          <Card className="border-primary/20 bg-primary/5 border-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-500" />
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Squad Intelligence
              </CardTitle>
              <CardDescription className="text-white/40">Select a team from standings to view roster.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTeam ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : selectedTeam ? (
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center p-2 border border-white/10">
                       {selectedTeam.teamLogo ? (
                         <img src={selectedTeam.teamLogo} alt={selectedTeam.teamName} className="object-contain w-full h-full" />
                       ) : (
                         <div className="font-bold text-primary">{selectedTeam.teamID}</div>
                       )}
                     </div>
                     <div>
                       <h3 className="font-black text-xl text-white tracking-tight">{selectedTeam.teamName}</h3>
                       <p className="text-xs text-white/30 uppercase font-bold tracking-widest">{selectedTeam.city} &bull; {selectedTeam.venueName}</p>
                     </div>
                   </div>
                   <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {selectedTeam.players?.length ? (
                        <>
                          <div>
                            <h4 className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-2 border-b border-white/5 pb-1">Starting XI (Top 11)</h4>
                            <div className="space-y-1">
                              {selectedTeam.players.slice(0, 11).map((p: any) => (
                                <Link 
                                  href={`/analysis?id=${p.playerID}&name=${encodeURIComponent(p.fullName)}`}
                                  key={p.playerID} 
                                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-xs border border-transparent hover:border-white/10 transition-all bg-white/5"
                                >
                                  <span className="text-white font-medium">{p.fullName}</span>
                                  <Badge variant="outline" className="text-[9px] h-4 bg-primary/20 border-primary/50 text-primary uppercase">{p.additionalInfo?.position || p.position || 'N/A'}</Badge>
                                </Link>
                              ))}
                            </div>
                          </div>
                          {selectedTeam.players.length > 11 && (
                            <div>
                              <h4 className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-2 border-b border-white/5 pb-1">Bench (Reserves)</h4>
                              <div className="space-y-1">
                                {selectedTeam.players.slice(11).map((p: any) => (
                                  <Link 
                                    href={`/analysis?id=${p.playerID}&name=${encodeURIComponent(p.fullName)}`}
                                    key={p.playerID} 
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 text-xs border border-transparent hover:border-white/10 transition-all"
                                  >
                                    <span className="text-white/60">{p.fullName}</span>
                                    <Badge variant="outline" className="text-[9px] h-4 bg-white/10 border-white/20 text-white/50 uppercase">{p.additionalInfo?.position || p.position || 'N/A'}</Badge>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-xs text-white/20 italic p-4 text-center">No squad data available for this team.</div>
                      )}
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/5 rounded-2xl opacity-40">
                  <Users className="w-12 h-12 mb-2 text-white/20" />
                  <p className="text-[10px] uppercase font-bold tracking-widest text-center mt-2 px-4">Select a team for quick view or details</p>
                </div>
              )}
            </CardContent>
            {selectedTeam && (
              <div className="p-4 bg-white/5 border-t border-white/10">
                <Button 
                  onClick={() => router.push(`/leagues/team/${selectedTeam.teamID}?seasonId=${activeLeague.seasonId}#squad`)}
                  className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Full Squad & Tactics
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
