"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Trophy, Calendar, Users, ChevronRight, MapPin } from "lucide-react";
import { getStandingsAction, getMatchesAction, getUpcomingMatchesAction, getTeamDetailsAction } from "@/app/actions/statorium";
import { StatoriumStanding, StatoriumMatch, StatoriumTeamDetail } from "@/lib/statorium/types";
import { MarketValue } from "./market-value";
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
  { id: "pl", name: "Premier League", seasonId: "515", flag: "https://flagcdn.com/w40/gb.png" },
  { id: "laliga", name: "La Liga", seasonId: "558", flag: "https://flagcdn.com/w40/es.png" },
  { id: "seriea", name: "Serie A", seasonId: "511", flag: "https://flagcdn.com/w40/it.png" },
  { id: "bundesliga", name: "Bundesliga", seasonId: "521", flag: "https://flagcdn.com/w40/de.png" },
  { id: "ligue1", name: "Ligue 1", seasonId: "519", flag: "https://flagcdn.com/w40/fr.png" },
];

// Helper function to format dates in a user-friendly way
function formatMatchDate(dateString: string): string {
  if (!dateString) return 'Date TBD';

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const matchDate = new Date(date);
  matchDate.setHours(0, 0, 0, 0);

  // Check if match is today
  if (matchDate.getTime() === today.getTime()) {
    return 'Today';
  }

  // Check if match is tomorrow
  if (matchDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  // Otherwise format the date normally
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

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
      const found = TOP_LEAGUES.find(l => l.id === sId || l.seasonId === sId);
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
        getUpcomingMatchesAction(activeLeague.seasonId, 10)
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
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">
            Tactical Hub
          </Badge>
          <h2 className="text-5xl font-bold tracking-tight text-foreground leading-none">
            League <span className="text-muted-foreground font-light">Insights</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-xl border border-border">
          {TOP_LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setActiveLeague(league)}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeLeague.id === league.id
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <div className="relative w-4 h-3 shrink-0 overflow-hidden rounded-sm border border-border/50">
                <Image src={league.flag} alt="" fill className="object-cover" unoptimized />
              </div>
              {league.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Standings Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">{activeLeague.name} Table</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Live Updates</span>
            </div>
          </div>

          <div className="premium-card rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-12">#</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Club</th>
                    <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">P</th>
                    <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">W</th>
                    <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">D</th>
                    <th className="px-4 py-4 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">L</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {loading ? (
                    Array(10).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={7} className="h-16 bg-muted/10" />
                      </tr>
                    ))
                  ) : (
                    standings.map((row, idx) => (
                      <tr
                        key={row.teamID || idx}
                        className={`group cursor-pointer hover:bg-primary/5 transition-all ${selectedTeam?.teamID === row.teamID ? 'bg-primary/5' : ''}`}
                        onClick={() => row.teamID && handleViewTeam(row.teamID)}
                      >
                        <td className="px-6 py-5 text-sm font-bold text-muted-foreground">{row.rank || idx + 1}</td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 relative bg-white rounded-xl p-1 shadow-sm border border-border shrink-0 group-hover:scale-110 transition-transform">
                              <Image src={row.teamLogo} alt={row.teamName} fill className="object-contain" />
                            </div>
                            <span className="font-bold text-sm text-foreground">{row.teamName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 text-center text-xs font-medium text-muted-foreground">{row.played || 0}</td>
                        <td className="px-4 py-5 text-center text-xs font-medium text-muted-foreground">{row.won || 0}</td>
                        <td className="px-4 py-5 text-center text-xs font-medium text-muted-foreground">{row.drawn || 0}</td>
                        <td className="px-4 py-5 text-center text-xs font-medium text-muted-foreground">{row.lost || 0}</td>
                        <td className="px-6 py-5 text-right font-bold text-base text-foreground">{row.points || 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Fixtures & Squad */}
        <div className="space-y-8">
          {/* Upcoming Matches */}
          <div className="premium-card p-8 rounded-[2rem] bg-gradient-to-br from-primary/5 to-transparent">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-8 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Upcoming Matches
            </h3>

            <div className="space-y-4">
              {loading ? (
                <div className="py-10 flex flex-col items-center gap-4 animate-pulse">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Scanning Schedule...</p>
                </div>
              ) : matches.length === 0 ? (
                <div className="p-8 border border-dashed border-border rounded-2xl text-center text-xs font-medium text-muted-foreground italic">
                  Schedule Data Unavailable
                </div>
              ) : (
                matches.slice(0, 5).map((match, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-border bg-card/50 hover:border-primary/20 transition-all group">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-3 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {formatMatchDate(match.matchDate)}</span>
                      <span>{match.matchTime}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-foreground truncate flex-1">{match.homeParticipant?.participantName || match.homeTeam?.teamName}</span>
                      <span className="text-[9px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">VS</span>
                      <span className="text-xs font-bold text-foreground truncate text-right flex-1">{match.awayParticipant?.participantName || match.awayTeam?.teamName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Featured Squad Area */}
          <div className="premium-card p-8 rounded-[2rem] flex flex-col min-h-[400px]">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-8 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Team Roster
            </h3>

            {loadingTeam ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Analyzing Squad...</p>
              </div>
            ) : selectedTeam ? (
              <div className="space-y-8 flex-1 flex flex-col">
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-muted/30 border border-border">
                  <div className="w-12 h-12 relative bg-white rounded-xl p-1 shadow-sm border border-border shrink-0">
                    <Image src={selectedTeam.teamLogo || ""} alt={selectedTeam.teamName} fill className="object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-foreground truncate">{selectedTeam.teamName}</h4>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase truncate mt-1">{selectedTeam.venueName}</p>
                  </div>
                </div>

                <ScrollArea className="flex-1 pr-4 h-[250px]">
                  <div className="space-y-2">
                    {selectedTeam.players?.map((p: any) => (
                      <div key={p.playerID} className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/30 transition-all group">
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{p.fullName}</span>
                          <span className="text-[9px] font-semibold text-muted-foreground uppercase mt-0.5">{p.position}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 rounded-[1.5rem] border-2 border-dashed border-border bg-muted/5">
                <Users className="w-12 h-12 text-muted-foreground/20 mb-6" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground max-w-[180px] leading-relaxed">
                  Select a team from the table to view their roster
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
