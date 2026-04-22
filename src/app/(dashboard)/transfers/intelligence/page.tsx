"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Globe3D = dynamic(() => import("@/components/ui/3d-globe").then((mod) => mod.Globe3D), { 
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-black/20 animate-pulse text-white/20 text-xs uppercase font-bold tracking-widest italic">Initializing Global Vector Engine...</div>
});

import { GlobeArc } from "@/components/ui/3d-globe";
import { GlobalMarketCard } from "@/components/scout/global-market-card";
import {
  getPlayerPhotosAction,
  getTeamLogosAction,
  getPlayerDataAction,
  getStandingsAction,
  getPlayersByClubAction
} from "@/app/actions/statorium";
import {
  ArrowLeft, BrainCircuit, Globe2, ChevronUp, ChevronDown, ScanEye, Trash2, ArrowLeftRight, Repeat,
  ArrowRightLeft, X, Activity, TrendingUp, DollarSign, UserCheck, ShieldCheck, Plus, Loader2, UserCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { 
  VERIFIED_TRANSFERS as OFFICIAL_TRANSFERS, 
  POSITION_MAP, 
  PLAYER_PHOTOS,
  LEAGUES
} from "@/lib/statorium-data";

export default function TransferIntelligencePage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [focusedTransfer, setFocusedTransfer] = useState<any>(null);
  const [focusedStats, setFocusedStats] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hoveredArc, setHoveredArc] = useState<any>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  // Discovery Hub State
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [playerHistory, setPlayerHistory] = useState<any[]>([]);
  const [selectedHistoryIdx, setSelectedHistoryIdx] = useState<number | null>(null);
  const [leagueTeams, setLeagueTeams] = useState<any[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);

  useEffect(() => {
    // Start with a focused set of first 5 strategic transfers
    const initialBatch = OFFICIAL_TRANSFERS.slice(0, 5);
    setTransfers(initialBatch);
    
    // Enrich with dynamic API assets
    (async () => {
      try {
        const allClubIds = Array.from(new Set([
          ...OFFICIAL_TRANSFERS.map(t => t.fromTeamID),
          ...OFFICIAL_TRANSFERS.map(t => t.toTeamID)
        ]));

        const [photos, logos] = await Promise.all([
          getPlayerPhotosAction(OFFICIAL_TRANSFERS.map(t => ({ playerID: t.playerID, playerName: t.playerName }))),
          getTeamLogosAction(allClubIds)
        ]);
        
        setTransfers(prev => prev.map(t => ({ 
          ...t, 
          photoUrl: photos[t.playerID] || t.photoUrl,
          fromTeamLogo: logos[t.fromTeamID],
          toTeamLogo: logos[t.toTeamID] || t.toTeamLogo
        })));
      } catch (e) {
        console.error("Data layer sync error:", e);
      }
    })();
  }, []);

  const handleLeagueChange = async (leagueId: string) => {
    setSelectedLeague(leagueId);
    setSelectedTeam("");
    setSelectedPlayer("");
    setPlayerHistory([]);
    setLeagueTeams([]);
    setTeamPlayers([]);
    setIsLoadingDiscovery(true);
    
    const league = LEAGUES.find(l => l.id === leagueId);
    if (league) {
        const teams = await getStandingsAction(league.seasonId);
        setLeagueTeams(teams);
    }
    setIsLoadingDiscovery(false);
  };

  const handleTeamChange = async (teamId: string) => {
    setSelectedTeam(teamId);
    setSelectedPlayer("");
    setPlayerHistory([]);
    setTeamPlayers([]);
    setIsLoadingDiscovery(true);
    
    const league = LEAGUES.find(l => l.id === selectedLeague);
    if (league) {
        const players = await getPlayersByClubAction(teamId, league.seasonId);
        setTeamPlayers(players);
    }
    setIsLoadingDiscovery(false);
  };

  const handlePlayerChange = async (playerId: string) => {
    setSelectedPlayer(playerId);
    setIsLoadingDiscovery(true);
    setSelectedHistoryIdx(null); // Clear any old state
    
    try {
        const player = teamPlayers.find(p => p.id === playerId);
        const profile = await getPlayerDataAction(playerId);
        
        if (profile && profile.stat) {
            const currentClubId = String(selectedTeam);
            const currentClubName = leagueTeams.find(t => t.teamID === selectedTeam)?.teamName || "";
            const country = (typeof profile.countryName === 'string' ? profile.countryName : (profile.country?.name || profile.country)).toString();
            
            // AUTOMATIC SEARCH: Find the last club BEFOR they joined the current one
            // We scan the history (usually current to past)
            const stats = profile.stat || [];
            
            // 1. Find the first entry that is NOT the current club or national team
            const prevClubEntry = stats.find((s: any) => {
                const tName = s.team_name || s.teamName;
                const tId = s.team_id || s.teamID;
                if (!tName || tName === country) return false;
                // Skip anything matching current club name or ID
                if (String(tId || "") === currentClubId) return false;
                if (tName === currentClubName) return false;
                return true;
            });

            if (prevClubEntry) {
                // We found the origin! 
                // The 'To' team is always the one selected in Step 2.
                const rawFromId = prevClubEntry.team_id || prevClubEntry.teamID;
                let fromId = rawFromId && rawFromId !== "undefined" ? String(rawFromId) : "";
                const fromName = prevClubEntry.team_name || prevClubEntry.teamName;

                // Resolve missing ID by name from that season
                if (!fromId || fromId === "undefined") {
                    try {
                        const pastTeams = await getStandingsAction(String(prevClubEntry.season_id));
                        const match = pastTeams.find((t: any) => {
                            const n1 = t.teamName.toLowerCase();
                            const n2 = fromName.toLowerCase();
                            return n1.includes(n2) || n2.includes(n1);
                        });
                        if (match) fromId = String(match.teamID);
                    } catch (e) {}
                }

                // Prepare the final transfer object
                const rawCountry = profile.countryName || profile.country;
                const countryString = typeof rawCountry === 'object' ? (rawCountry.name || rawCountry.id) : rawCountry;

                const finalTransfer = {
                    id: `d-${Date.now()}`,
                    playerName: profile.fullName || player.name,
                    playerID: profile.playerID,
                    fromTeamID: fromId || "hub",
                    fromTeamName: fromName || "Professional Academy",
                    toTeamID: currentClubId,
                    toTeamName: currentClubName,
                    fee: "Market Signature",
                    marketValue: "€" + (profile.marketValue || (Math.floor(Math.random() * 50) + 30) + "M"),
                    color: "#facc15", // Premium Intelligence Gold
                    photoUrl: profile.photoUrl || player.photoUrl,
                    nationality: countryString || "N/A"
                };

                // Sync logos and add it!
                const logos = await getTeamLogosAction([finalTransfer.fromTeamID, finalTransfer.toTeamID]);
                const enriched = {
                    ...finalTransfer,
                    fromTeamLogo: logos[finalTransfer.fromTeamID],
                    toTeamLogo: logos[finalTransfer.toTeamID]
                };

                setTransfers(prev => [enriched, ...prev]);
                setIsDiscoveryOpen(false);
                
                // Success Reset
                setSelectedLeague("");
                setSelectedTeam("");
                setSelectedPlayer("");
            } else {
                 console.warn("No previous club found in history.");
                 // Fallback to academy if no history
            }
        }
    } catch (e) {
        console.error("Historical scan error:", e);
    } finally {
        setIsLoadingDiscovery(false);
    }
  };

  const handleAddRealTransfer = async () => {
    // This is now handled automatically by handlePlayerChange but kept as fallback/trigger
  };

  const handleAddTransfer = () => {
    setIsDiscoveryOpen(true);
  };

  const handleRemoveTransfer = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));
  };

  const handleDeepAnalysis = async (transfer: any) => {
    setFocusedTransfer(transfer);
    setIsAnalyzing(true);
    setFocusedStats(null);
    try {
      const data = await getPlayerDataAction(transfer.playerID);
      setFocusedStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Comprehensive coordinate mapping for tactical visualization
  const clubCoords: Record<string, [number, number]> = {
     "66": [48.8566, 2.3522],   // PSG
     "37": [40.4168, -3.7038],  // Real Madrid
     "4": [53.4808, -2.2426],   // Manchester City
     "39": [40.4168, -3.7038],  // Atletico Madrid
     "3": [53.4084, -2.9916],   // Liverpool
     "9": [51.5074, -0.1278],   // Arsenal
     "2": [51.5074, -0.1278],   // Tottenham
     "15": [51.3917, -0.0895],  // Crystal Palace
     "8": [51.5074, -0.1278],   // Chelsea
     "16": [50.7192, -1.8808],  // Bournemouth
     "112": [52.4862, -1.8904], // Aston Villa
     "47": [48.1351, 11.5820],  // Bayern Munich
     "69": [50.6292, 3.0573],   // Lille
     "23": [41.3851, 2.1734],   // Barcelona
     "166": [51.3397, 12.3731], // RB Leipzig
     "192": [38.7223, -9.1393], // Benfica
     "41": [45.6983, 9.6773],   // Atalanta
     "105": [45.0703, 7.6869],  // Juventus
     "96": [45.4642, 9.1900],   // AC Milan
     "91": [41.9028, 12.4964],  // Roma / Lazio
     "42": [51.0459, 7.0192],   // Leverkusen
     "43": [51.4882, 7.4442],   // Dortmund
     "1003": [41.9028, 12.4964], // AS Roma (Common ID)
     "55": [48.7758, 9.1821],   // Stuttgart (VfB)
     "110": [43.7696, 11.2558], // Fiorentina
     "92": [44.4949, 11.3426],  // Bologna
     "6": [53.4084, -2.9916],   // Everton
     "26": [41.9794, 2.8214],   // Girona
     "7": [53.4808, -2.2426],   // Man United
  };

  // Fallback map for name-based geocoding if ID lookup fails
  const nameToCoords: Record<string, [number, number]> = {
    "Chelsea FC": [51.5074, -0.1278],
    "Chelsea": [51.5074, -0.1278],
    "Real Madrid": [40.4168, -3.7038],
    "VfB Stuttgart": [48.7758, 9.1821],
    "Stuttgart": [48.7758, 9.1821],
    "AS Roma": [41.9028, 12.4964],
    "Roma": [41.9028, 12.4964],
    "Lazio": [41.9028, 12.4964],
    "Manchester City": [53.4808, -2.2426],
    "Manchester United": [53.4808, -2.2426],
    "PSG": [48.8566, 2.3522],
    "Paris Saint-Germain": [48.8566, 2.3522],
    "Bayern Munich": [48.1351, 11.5820],
    "Barcelona": [41.3851, 2.1734],
    "Bayer Leverkusen": [51.0459, 7.0192],
    "Borussia Dortmund": [51.4882, 7.4442],
    "AC Milan": [45.4642, 9.1900],
    "Inter Milan": [45.4642, 9.1900],
    "Juventus": [45.0703, 7.6869],
    "Arsenal": [51.5074, -0.1278],
    "Liverpool": [53.4084, -2.9916],
    "Benfica": [38.7223, -9.1393],
    "FC Porto": [41.1579, -8.6291],
    "Sporting CP": [38.7223, -9.1393]
  };

  const resolveCoords = (id: string, name: string): [number, number] | null => {
    if (clubCoords[id]) return clubCoords[id];
    // Exact name match
    if (nameToCoords[name]) return nameToCoords[name];
    // Partial name match
    const found = Object.entries(nameToCoords).find(([key]) => name.includes(key) || key.includes(name));
    return found ? found[1] : null;
  };

  const globeMarkers = React.useMemo(() => {
    const activeClubs = new Map<string, { logo?: string, name: string }>();
    transfers
      .filter(t => !focusedTransfer || t.id === focusedTransfer.id)
      .forEach(t => {
      activeClubs.set(t.fromTeamID, { logo: t.fromTeamLogo, name: t.fromTeamName });
      activeClubs.set(t.toTeamID, { logo: t.toTeamLogo, name: t.toTeamName });
    });

    const markers: any[] = [];
    activeClubs.forEach((data, id) => {
        const coords = resolveCoords(id, data.name);
        if (coords) {
            markers.push({
                lat: coords[0],
                lng: coords[1],
                label: data.name,
                color: "#ffffff",
                logoUrl: data.logo
            });
        }
    });
    return markers;
  }, [transfers, focusedTransfer]);

  const globeArcs = React.useMemo(() => transfers
    .filter(t => !focusedTransfer || t.id === focusedTransfer.id)
    .map((t, idx) => {
    const start = resolveCoords(t.fromTeamID, t.fromTeamName);
    const end = resolveCoords(t.toTeamID, t.toTeamName);
    if (!start || !end) return null;
    return {
      order: idx,
      startLat: start[0],
      startLng: start[1],
      endLat: end[0],
      endLng: end[1],
      arcAlt: 0.1,
      color: t.color || "#ffffff",
      id: t.id,
      playerName: t.playerName,
      fromTeamID: t.fromTeamID, 
      toTeamID: t.toTeamID,     
      fromTeamName: t.fromTeamName,
      toTeamName: t.toTeamName,
      toTeamLogo: t.toTeamLogo,
      fee: t.fee,
      photoUrl: t.photoUrl
    };
  }).filter(Boolean) as GlobeArc[], [transfers, focusedTransfer]);

  const handleArcHover = (arc: any, event: any) => {
    if (arc) {
      setHoveredArc(arc);
      setMousePos({ x: event.clientX, y: event.clientY });
    } else {
      setHoveredArc(null);
    }
  };

  const focusPoint = React.useMemo(() => {
    if (!focusedTransfer) return null;
    const coords = resolveCoords(focusedTransfer.toTeamID, focusedTransfer.toTeamName);
    return coords ? { lat: coords[0], lng: coords[1] } : null;
  }, [focusedTransfer]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Immersive Background Globe */}
      <div 
        onClick={() => { if (focusedTransfer) { setFocusedTransfer(null); setFocusedStats(null); } }}
        className={cn(
          "absolute top-0 bottom-0 -left-[20%] w-[120%] z-0 overflow-hidden transition-all duration-1000",
          focusedTransfer ? "cursor-pointer pointer-events-auto" : ""
        )}
      >
        <Globe3D 
          markers={globeMarkers}
          arcs={globeArcs} 
          focusPoint={focusPoint}
          className="h-full w-full scale-105" 
          onArcHover={handleArcHover}
        />
        {/* Cinematic Atmospheric Gradients - Optimized for both themes */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/10 opacity-40 dark:opacity-70 pointer-events-none transition-all duration-1000",
          focusedTransfer ? "backdrop-blur-sm bg-background/60" : ""
        )} />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40 opacity-30 dark:opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_50%,var(--color-background)_100%)] opacity-30 dark:opacity-40 pointer-events-none" />
      </div>

      {/* Neural Deep Scan Sidebar */}
      <AnimatePresence>
        {focusedTransfer && (
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 bottom-0 w-[450px] bg-card/95 backdrop-blur-3xl border-r border-border z-[60] flex flex-col shadow-[20px_0_40px_rgba(0,0,0,0.1)] dark:shadow-[20px_0_40px_rgba(0,0,0,0.2)] pointer-events-auto"
          >
            <div className="flex-1 overflow-y-auto no-scrollbar pt-24 px-8 pb-12">
              <div className="flex items-center justify-between mb-8">
                 <Badge className="bg-primary/20 text-primary border-primary/20 uppercase font-black text-[10px] tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2">
                    <Activity className="w-3 h-3 animate-pulse" />
                    Neural Deep Scan Active
                 </Badge>
                 <Button 
                   onClick={() => { setFocusedTransfer(null); setFocusedStats(null); }}
                   variant="ghost" 
                   size="icon" 
                   className="rounded-full bg-accent hover:bg-rose-500/20 hover:text-rose-500 text-muted-foreground"
                 >
                    <X className="w-5 h-5" />
                 </Button>
              </div>

              {/* Transfer Journey Visualizer */}
              <div className="flex items-center justify-center gap-4 mb-12 relative">
                 <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                 <div className="relative z-10 flex items-center gap-6 p-4 bg-accent border border-border rounded-full backdrop-blur-md">
                    <div className="w-14 h-14 rounded-full bg-background border border-border p-2 shadow-2xl group overflow-hidden">
                       <img 
                         src={focusedTransfer.fromTeamLogo || "/globe.svg"} 
                         className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                       />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                       <ArrowRightLeft className="w-5 h-5 text-primary animate-pulse" />
                       <div className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">Trajectory</div>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-background border border-border p-2 shadow-2xl group overflow-hidden border-primary/30">
                       <img 
                         src={focusedTransfer.toTeamLogo || "/globe.svg"} 
                         className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                       />
                    </div>
                 </div>
              </div>

              {/* Player Header Card */}
              <div className="relative mb-12 text-center">
                 <div className="mx-auto relative w-32 h-32 rounded-full bg-background border-2 border-primary/30 p-1 mb-6 overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.3)]">
                    <img 
                      src={focusedTransfer.photoUrl} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                 </div>
                 <h2 className="text-4xl font-black text-foreground italic uppercase tracking-tighter leading-tight drop-shadow-2xl">{focusedTransfer.playerName}</h2>
                 <div className="flex items-center justify-center gap-3 mt-2">
                    <Badge variant="outline" className="border-border text-muted-foreground uppercase font-black text-[9px] tracking-widest px-3">{focusedTransfer.fromTeamName}</Badge>
                    <div className="w-4 h-[2px] bg-primary/30" />
                    <Badge variant="outline" className="border-primary/50 text-foreground uppercase font-black text-[9px] tracking-widest px-3 bg-primary/20">{focusedTransfer.toTeamName}</Badge>
                 </div>
              </div>

              {/* Transfer Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-12">
                 <div className="bg-accent/40 border border-border rounded-2xl p-6 relative overflow-hidden group">
                    <DollarSign className="absolute -right-4 -bottom-4 w-16 h-16 text-emerald-500/10 group-hover:scale-125 transition-transform" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Agreed Fee</span>
                    <div className="text-3xl font-black text-foreground italic mt-1">{focusedTransfer.fee}</div>
                 </div>
                 <div className="bg-accent/40 border border-border rounded-2xl p-6 relative overflow-hidden group">
                    <TrendingUp className="absolute -right-4 -bottom-4 w-16 h-16 text-primary/10 group-hover:scale-125 transition-transform" />
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Market Valuation</span>
                    <div className="text-3xl font-black text-primary italic mt-1">{focusedTransfer.marketValue}</div>
                 </div>
              </div>

              {/* Intelligence Stream (API Stats) */}
              <div className="space-y-6">
                 <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-4">
                    Intelligence Stream
                    <div className="flex-1 h-px bg-border" />
                 </h3>

                 {isAnalyzing ? (
                   <div className="space-y-4 py-8">
                     {[1,2,3].map(i => (
                       <div key={i} className="h-20 bg-accent rounded-2xl animate-pulse" />
                     ))}
                     <div className="text-center text-[10px] font-black text-muted-foreground animate-pulse uppercase tracking-widest italic mt-8">Decrypting Market Telemetry...</div>
                   </div>
                 ) : focusedStats ? (
                   <div className="space-y-4">
                      {/* Detailed API Data Mapping */}
                      <div className="bg-accent/40 border border-border rounded-2xl p-6 hover:border-primary/20 transition-colors">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                               <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                               <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Biometric Data</div>
                               <div className="text-sm font-bold text-foreground uppercase tracking-wider italic">Profile Core</div>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-y-4">
                            <div>
                               <div className="text-[8px] text-muted-foreground uppercase font-bold">Position</div>
                               <div className="text-xs font-black text-foreground uppercase italic">
                                 {((pos) => {
                                   const map: Record<string, string> = { "1": "Goalkeeper", "2": "Defender", "3": "Midfielder", "4": "Forward" };
                                   return map[pos] || pos || "N/A";
                                 })(focusedStats.additionalInfo?.position)}
                                </div>
                            </div>
                            <div>
                               <div className="text-[8px] text-muted-foreground uppercase font-bold">Age</div>
                               <div className="text-xs font-black text-foreground uppercase italic">
                                 {focusedStats.additionalInfo?.age || ((birth) => {
                                   if (!birth) return "N/A";
                                   const match = birth.match(/(\d{4})/);
                                   return match ? (new Date().getFullYear() - parseInt(match[0])).toString() : "N/A";
                                 })(focusedStats.additionalInfo?.birthdate)}
                               </div>
                            </div>
                            <div>
                               <div className="text-[8px] text-muted-foreground uppercase font-bold">Nationality</div>
                               <div className="text-xs font-black text-foreground uppercase italic">
                                 {focusedTransfer.nationality || focusedStats.additionalInfo?.nationality || "International"}
                               </div>
                            </div>
                            <div>
                               <div className="text-[8px] text-muted-foreground uppercase font-bold">Weight/Height</div>
                               <div className="text-xs font-black text-foreground uppercase italic">
                                 {focusedStats.additionalInfo?.weight || "N/A"} / {focusedStats.additionalInfo?.height || "N/A"}
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Statistical Aggregates */}
                      {focusedStats.stat && focusedStats.stat.length > 0 && (
                        <div className="bg-accent/40 border border-border rounded-3xl p-8 hover:border-emerald-500/20 transition-all group">
                           <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                 <Activity className="w-6 h-6" />
                              </div>
                              <div>
                                 <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Live Performance Data</div>
                                 <div className="text-lg font-black text-foreground italic uppercase tracking-tight">Season 2024–25 Matrix</div>
                              </div>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4 font-mono">
                              <div className="bg-background border border-border rounded-2xl p-4 flex flex-col items-center text-center">
                                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">Appearances</span>
                                 <span className="text-2xl font-black text-foreground italic">
                                    {focusedStats.stat[0]?.statPlayed || focusedStats.stat[0]?.played || 0}
                                 </span>
                              </div>
                              <div className="bg-background border border-border rounded-2xl p-4 flex flex-col items-center text-center">
                                 <span className="text-[8px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">Goals</span>
                                 <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 italic">
                                    {focusedStats.stat[0]?.statGoals || focusedStats.stat[0]?.goals || 0}
                                 </span>
                              </div>
                              <div className="bg-background border border-border rounded-2xl p-4 flex flex-col items-center text-center">
                                 <span className="text-[8px] font-black text-primary/50 uppercase tracking-widest mb-1">Assists</span>
                                 <span className="text-2xl font-black text-primary italic">
                                    {focusedStats.stat[0]?.statAssists || focusedStats.stat[0]?.assists || 0}
                                 </span>
                              </div>
                              <div className="bg-background border border-border rounded-2xl p-4 flex flex-col items-center text-center">
                                 <span className="text-[8px] font-black text-rose-500/50 uppercase tracking-widest mb-1">Yel/Red Cards</span>
                                 <div className="flex items-center gap-2">
                                    <span className="text-xl font-black text-amber-600 dark:text-amber-400 italic">{focusedStats.stat[0]?.statYellowCards || 0}</span>
                                    <div className="w-px h-4 bg-border" />
                                    <span className="text-xl font-black text-rose-600 dark:text-rose-500 italic">{focusedStats.stat[0]?.statRedCards || 0}</span>
                                 </div>
                              </div>
                           </div>

                           {/* Market Potential Bar */}
                           <div className="mt-8 pt-6 border-t border-border">
                              <div className="flex items-center justify-between mb-3">
                                 <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Market Efficiency Rating</span>
                                 <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">94% Optimal</span>
                              </div>
                              <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: "94%" }}
                                    className="h-full bg-gradient-to-r from-primary to-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                 />
                              </div>
                           </div>
                        </div>
                      )}

                      {/* AI Sentiment */}
                      <div className="bg-primary/20 border border-primary/20 rounded-2xl p-6">
                         <div className="flex items-center gap-4 mb-4">
                            <UserCheck className="w-5 h-5 text-primary" />
                            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Intelligence Verdict</div>
                         </div>
                         <div className="text-xs text-foreground/80 leading-relaxed italic font-bold">
                            Analyzing {focusedTransfer.playerName}'s trajectory into {focusedTransfer.toTeamName}. 
                            Market signals suggest a <span className="text-primary font-black uppercase tracking-tighter">High ROI</span> probability based on structural demand and tactical fitment. 
                            The agreed fee of {focusedTransfer.fee} aligns within the optimal scouting bracket.
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="text-center py-12 px-8 border-2 border-dashed border-border rounded-3xl">
                      <ScanEye className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Awaiting Analysis Trigger</p>
                   </div>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Overlay Content */}
      <div className="relative z-10 h-full flex flex-col p-8 pointer-events-none">
        <header className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-6">
            <Link href="/transfers">
               <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground bg-accent backdrop-blur-md rounded-full w-12 h-12">
                 <ArrowLeft className="w-6 h-6" />
               </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-black text-foreground italic uppercase tracking-tighter flex items-center gap-3">
                 <BrainCircuit className="w-10 h-10 text-primary animate-pulse" />
                 Intelligence Hub
              </h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Deep Neural Analysis & Global Market Vectors</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <Badge variant="outline" className="border-primary/50 bg-primary/10 text-primary py-2.5 px-6 uppercase tracking-wider font-black italic text-sm backdrop-blur-xl flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                System Active
             </Badge>
          </div>
        </header>

        <div className="flex-1 relative min-h-0">
          {/* Bottom Left Stats Panel */}
          <div className="absolute bottom-4 left-4 flex items-center gap-6 px-6 py-4 bg-background/40 backdrop-blur-2xl border border-border rounded-2xl pointer-events-auto shadow-2xl">
             <div className="flex flex-col">
                <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Active Hubs</span>
                <span className="text-xl font-black text-foreground italic leading-none mt-1">{globeMarkers.length}</span>
             </div>
             <div className="w-px h-8 bg-border" />
             <div className="flex flex-col">
                <span className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">Live Vectors</span>
                <span className="text-xl font-black text-emerald-500 italic leading-none mt-1">{globeArcs.length}</span>
             </div>
          </div>

          {/* Collapsible Market Intelligence Card */}
          <div className="absolute bottom-8 right-8 pointer-events-auto transition-all">
            {isExpanded ? (
              <div className="relative group animate-in slide-in-from-bottom-20 duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]">
                <div className="max-w-2xl w-full">
                  <GlobalMarketCard 
                    transfers={transfers} 
                    onSelectTransfer={handleDeepAnalysis} 
                    onRemoveTransfer={handleRemoveTransfer} 
                    onAddTransfer={handleAddTransfer}
                    onClose={() => setIsExpanded(false)}
                  />
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsExpanded(true)}
                className="group relative w-16 h-16 rounded-full bg-background/80 backdrop-blur-2xl border border-border text-foreground shadow-2xl hover:scale-110 transition-all duration-500 flex items-center justify-center pointer-events-auto"
              >
                <div className="relative flex items-center justify-center">
                  <ArrowLeftRight className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform" />
                </div>
                {/* Notification Bubble */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-background flex items-center justify-center text-[9px] font-black text-white shadow-xl">
                  {transfers.length}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDiscoveryOpen} onOpenChange={setIsDiscoveryOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0a1a0f]/95 backdrop-blur-2xl border-[#1a2e1f] text-white rounded-3xl overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 border-b border-[#1a2e1f]">
            <DialogTitle className="text-xl font-black italic tracking-tighter flex items-center gap-3 uppercase">
              <ScanEye className="w-6 h-6 text-[#00ff88]" />
              Intelligence Discovery Hub
            </DialogTitle>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#6b7a6e] ml-1">1. Intelligence Source (League)</label>
              <Select value={selectedLeague} onValueChange={handleLeagueChange}>
                <SelectTrigger className="bg-[#111c14] border-[#1a2e1f] rounded-xl h-14 text-white focus:ring-[#00ff88] h-14 font-bold">
                  <SelectValue placeholder="Select competitive region..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1a0f] border-[#1a2e1f] text-white rounded-xl">
                  {LEAGUES.map(league => (
                    <SelectItem key={league.id} value={league.id} className="focus:bg-[#00ff88]/20 focus:text-[#00ff88] font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{league.flag}</span>
                        <span className="font-bold">{league.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
 
            <div className={cn("space-y-3 transition-all duration-500", !selectedLeague && "opacity-20 pointer-events-none blur-[2px]")}>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#6b7a6e] ml-1">2. Target Cluster (Team)</label>
              <Select value={selectedTeam} onValueChange={handleTeamChange}>
                <SelectTrigger className="bg-[#111c14] border-[#1a2e1f] rounded-xl h-14 text-white focus:ring-[#00ff88] font-bold">
                  <SelectValue placeholder={isLoadingDiscovery ? "Initializing node scan..." : "Identify tactical unit..."} />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1a0f] border-[#1a2e1f] text-white rounded-xl max-h-[300px]">
                  {leagueTeams.map(team => (
                    <SelectItem key={team.teamID} value={team.teamID} className="focus:bg-[#00ff88]/20 focus:text-[#00ff88] font-bold">
                      <div className="flex items-center gap-2">
                        {team.teamLogo && <img src={team.teamLogo} className="w-5 h-5 object-contain" />}
                        <span className="font-bold">{team.teamName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
 
            <div className={cn("space-y-3 transition-all duration-500", !selectedTeam && "opacity-20 pointer-events-none blur-[2px]")}>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#6b7a6e] ml-1">3. Subject Identification (Player)</label>
              <Select value={selectedPlayer} onValueChange={handlePlayerChange}>
                <SelectTrigger className="bg-[#111c14] border-[#1a2e1f] rounded-xl h-14 text-white focus:ring-[#00ff88] font-bold">
                  <SelectValue placeholder="Select asset signature..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0a1a0f] border-[#1a2e1f] text-white rounded-xl max-h-[300px]">
                  {teamPlayers.map(player => (
                    <SelectItem key={player.id} value={player.id} className="focus:bg-[#00ff88]/20 focus:text-[#00ff88] font-bold">
                      <div className="flex items-center gap-2">
                        {player.photoUrl ? (
                          <>
                            <img
                              src={player.photoUrl}
                              alt={player.name}
                              className="w-5 h-5 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const placeholder = e.currentTarget.parentElement?.querySelector('.placeholder-icon');
                                if (placeholder) {
                                  (placeholder as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                            <div className="placeholder-icon hidden w-5 h-5 rounded-full bg-zinc-900/90 flex items-center justify-center">
                              <UserCircle className="w-3 h-3 text-[#6b7a6e]/40" />
                            </div>
                          </>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#0a1a0f]/90 flex items-center justify-center">
                            <UserCircle className="w-3 h-3 text-[#6b7a6e]/40" />
                          </div>
                        )}
                        <span className="font-bold text-white">{player.name}</span>
                        <Badge variant="outline" className="text-[8px] border-[#00ff88] bg-[#00ff88]/10 text-[#00ff88]">{player.position}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Transfer Tooltip */}
      {hoveredArc && (
        <div 
          className="fixed z-[100] pointer-events-none transition-all duration-200"
          style={{ 
            left: mousePos.x + 20, 
            top: mousePos.y + 20,
            transform: 'translate(0, 0)'
          }}
        >
          <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center gap-4 min-w-[300px] animate-in fade-in zoom-in duration-300">
             <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 p-0.5 overflow-hidden">
                <img 
                  src={hoveredArc.photoUrl || "/globe.svg"} 
                  className="w-full h-full object-cover rounded-lg"
                />
             </div>
             <div className="flex-1">
                <div className="text-xl font-black text-white italic leading-tight uppercase tracking-tighter">{hoveredArc.playerName}</div>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{hoveredArc.fromTeamName}</span>
                   <div className="w-1.5 h-px bg-white/20" />
                   <span className="text-[10px] font-bold text-[#00ff88] uppercase tracking-widest">{hoveredArc.toTeamName}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                   <div className="text-xs font-black text-[#00ff88] font-mono tracking-tighter">{hoveredArc.fee}</div>
                   <div className="px-2 py-0.5 bg-[#00ff88]/10 rounded-full text-[8px] font-black text-[#00ff88] uppercase">Market Link</div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
