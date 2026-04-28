"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  MapPin, 
  Trophy, 
  Users, 
  TrendingUp, 
  ChevronLeft, 
  ExternalLink,
  Target,
  Activity,
  Award,
  Star,
  ArrowRightLeft,
  CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { addToWatchlist, getWatchlist } from "@/app/actions/watchlist";
import { SafeImage } from "@/components/ui/safe-image";
import { useEffect } from "react";

interface ClubDetailsClientProps {
  teamDetails: any;
  leagueInfo: any;
  standing: any;
  seasonId: string | undefined;
}

export default function ClubDetailsClient({ 
  teamDetails, 
  leagueInfo, 
  standing,
  seasonId
}: ClubDetailsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lineup' | 'squad'>('lineup');
  const [filterPos, setFilterPos] = useState<'ALL' | 'GK' | 'DF' | 'MF' | 'FW'>('ALL');
  
  // Interactive Squad Management State
  const allPlayers = teamDetails.players || [];
  const [pitchPlayers, setPitchPlayers] = useState(allPlayers.slice(0, 11));
  const [benchPlayers, setBenchPlayers] = useState(allPlayers.slice(11, 20));
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [watchlistStatus, setWatchlistStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const watchlist = await getWatchlist();
        const statusMap: Record<string, boolean> = {};
        watchlist.forEach((p: any) => {
          if (p.player_id) {
            statusMap[String(p.player_id)] = true;
          }
        });
        setWatchlistStatus(statusMap);
      } catch (err) {
        console.error("Failed to fetch watchlist:", err);
      }
    };
    fetchWatchlist();
  }, []);

  const handleAddToWatchlist = async (player: any) => {
     const pid = String(player.playerID);
     // Don't add if already following
     if (watchlistStatus[pid]) return;

     try {
        const res = await addToWatchlist({
           player_id: pid,
           player_name: player.playerFullName || player.fullName,
           club: teamDetails.teamName,
           club_logo: teamDetails.teamLogo,
           position: player.position,
           league: leagueInfo?.name || "Unknown",
           player_photo: player.playerPhoto,
           market_value: player.marketValue || "N/A",
           weight: player.weight || "N/A",
           height: player.height || "N/A",
           age: "25" // Placeholder
        });
        
        if (res.success) {
          setWatchlistStatus((prev: Record<string, boolean>) => ({ ...prev, [player.playerID]: true }));
        } else if (res.error) {
          alert(res.error);
        }
     } catch (err) {
        console.error("Watchlist Error:", err);
     }
  };

  const handlePlayerClick = (player: any, source: 'pitch' | 'bench') => {
    if (!selectedPlayer) {
      setSelectedPlayer({ ...player, source });
      return;
    }

    // If clicking same player, deselect
    if (selectedPlayer.playerID === player.playerID) {
      setSelectedPlayer(null);
      return;
    }

    // If clicking another player in same source, change selection
    if (selectedPlayer.source === source) {
      setSelectedPlayer({ ...player, source });
      return;
    }

    // Swap Logic (One from pitch, one from bench)
    const pitchP = selectedPlayer.source === 'pitch' ? selectedPlayer : player;
    const benchP = selectedPlayer.source === 'bench' ? selectedPlayer : player;

    // Position Validation: Strikers/Midfielders/Defenders cannot replace a GK if it's the GK spot
    // In our TacticalField, the last row is reserved for GK.
    if (pitchP.position === 'GK' && benchP.position !== 'GK') {
       alert("Tactical Error: Only a Goalkeeper can occupy the GK position.");
       setSelectedPlayer(null);
       return;
    }

    // Perform Swap
    setPitchPlayers((prev: any[]) => prev.map((p: any) => p.playerID === pitchP.playerID ? benchP : p));
    setBenchPlayers((prev: any[]) => prev.map((p: any) => p.playerID === benchP.playerID ? pitchP : p));
    setSelectedPlayer(null);
  };

  // Categorize for UI
  const gks = allPlayers.filter((p: any) => p.position === 'GK');
  const dfs = allPlayers.filter((p: any) => p.position === 'DF');
  const mfs = allPlayers.filter((p: any) => p.position === 'MF' || p.position === 'CAM' || p.position === 'CDM');
  const fws = allPlayers.filter((p: any) => p.position === 'FW' || p.position === 'ST' || p.position === 'RW' || p.position === 'LW');

  const getPVal = useCallback((arr: any[], keys: string[]) => {
    return (arr || []).reduce((acc, s) => {
      let val = 0;
      for (const k of keys) {
        const actualKey = Object.keys(s).find(sk => sk.toLowerCase() === k.toLowerCase());
        if (actualKey) { val = parseInt(s[actualKey]) || 0; break; }
      }
      return acc + val;
    }, 0);
  }, []);

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((p: any) => {
      if (filterPos === 'ALL') return true;
      const pos = p.position?.toUpperCase() || "";
      if (filterPos === 'DF') return pos === 'CB' || pos === 'LB' || pos === 'RB' || pos === 'DF';
      if (filterPos === 'MF') return pos === 'CDM' || pos === 'CM' || pos === 'CAM' || pos === 'MF';
      if (filterPos === 'FW') return pos === 'RW' || pos === 'LW' || pos === 'ST' || pos === 'FW';
      return pos === filterPos;
    }).sort((a: any, b: any) => {
      const priority: any = { 'GK': 0, 'DF': 1, 'CB': 1, 'LB': 1, 'RB': 1, 'MF': 2, 'CDM': 2, 'CM': 2, 'CAM': 2, 'FW': 3, 'ST': 3, 'RW': 3, 'LW': 3 };
      return (priority[a.position?.toUpperCase()] ?? 99) - (priority[b.position?.toUpperCase()] ?? 99);
    });
  }, [allPlayers, filterPos]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 lg:p-8 transition-colors duration-300">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-8">
         <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
         >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-accent">
               <ChevronLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Back to League</span>
         </button>
      </div>

      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-4 gap-12">
         {/* Main Content: Tactical Pitch (Left 3 Columns) */}
         <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-6">
                  <h2 className="text-xl font-black italic tracking-tighter uppercase text-emerald-500 flex items-center gap-4">
                     <div className="w-12 h-1 bg-emerald-500" />
                     Squad Management Engine
                  </h2>
                  <div className="h-10 w-px bg-border hidden md:block" />
                  <div className="hidden lg:flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-500" />
                     </div>
                     <div>
                        <p className="text-[7px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Head Coach</p>
                        <p className="text-sm font-black italic tracking-tight leading-none text-foreground">{teamDetails.coach || "Unassigned"}</p>
                     </div>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button 
                     onClick={() => setActiveTab('lineup')}
                     className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'lineup' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                  >
                     Tactical View
                  </button>
                  <button 
                     onClick={() => setActiveTab('squad')}
                     className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'squad' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                  >
                     Full Squad
                  </button>
               </div>
            </div>

            {activeTab === 'squad' && (
               <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tactical Filter:</span>
                  <div className="flex gap-2">
                     {[
                        { id: 'ALL', label: 'All Players' },
                        { id: 'GK', label: 'Goalkeepers' },
                        { id: 'DF', label: 'Defenders' },
                        { id: 'MF', label: 'Midfielders' },
                        { id: 'FW', label: 'Forwards' }
                     ].map(f => (
                        <button
                           key={f.id}
                           onClick={() => setFilterPos(f.id as any)}
                           className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filterPos === f.id ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                           {f.label}
                        </button>
                     ))}
                  </div>
               </div>
            )}

            {activeTab === 'lineup' ? (
               <div className="space-y-12">
                  <div className="relative aspect-[4/5] max-w-4xl mx-auto bg-[#1a472a] rounded-[2rem] border-[8px] border-white/10 overflow-hidden shadow-2xl group/pitch">
                     {/* Professional Pitch Surface - Grass Pattern */}
                     <div className="absolute inset-0 opacity-20" style={{ 
                        backgroundImage: 'repeating-linear-gradient(0deg, #1d5c36, #1d5c36 10%, #1a472a 10%, #1a472a 20%)',
                        backgroundSize: '100% 100%' 
                     }} />
                     
                     {/* Pitch Lighting Effect */}
                     <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
 
                     {/* Pitch Markings SVG */}
                     <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 300 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="15" y="15" width="270" height="370" stroke="white" strokeWidth="1.5" />
                        <line x1="15" y1="200" x2="285" y2="200" stroke="white" strokeWidth="1.5" />
                        <circle cx="150" cy="200" r="40" stroke="white" strokeWidth="1.5" />
                        <circle cx="150" cy="200" r="1.5" fill="white" />
                        <rect x="60" y="15" width="180" height="60" stroke="white" strokeWidth="1.5" />
                        <rect x="110" y="15" width="80" height="20" stroke="white" strokeWidth="1.5" />
                        <circle cx="150" cy="55" r="1" fill="white" />
                        <path d="M 110 75 A 40 40 0 0 0 190 75" stroke="white" strokeWidth="1.5" />
                        <rect x="60" y="325" width="180" height="60" stroke="white" strokeWidth="1.5" />
                        <rect x="110" y="365" width="80" height="20" stroke="white" strokeWidth="1.5" />
                        <circle cx="150" cy="345" r="1" fill="white" />
                        <path d="M 110 325 A 40 40 0 0 1 190 325" stroke="white" strokeWidth="1.5" />
                        <path d="M 15 30 A 15 15 0 0 0 30 15" stroke="white" strokeWidth="1.5" opacity="0.5" />
                        <path d="M 270 15 A 15 15 0 0 0 285 30" stroke="white" strokeWidth="1.5" opacity="0.5" />
                        <path d="M 15 370 A 15 15 0 0 1 30 385" stroke="white" strokeWidth="1.5" opacity="0.5" />
                        <path d="M 270 385 A 15 15 0 0 1 285 370" stroke="white" strokeWidth="1.5" opacity="0.5" />
                     </svg>
                     
                     {/* Tactical Lineup Visualization */}
                     <div className="absolute inset-0 p-10">
                        <TacticalField 
                           players={pitchPlayers} 
                           formation={teamDetails.formation} 
                           onPlayerClick={(p) => handlePlayerClick(p, 'pitch')}
                           selectedId={selectedPlayer?.playerID}
                        />
                     </div>
                  </div>

                  {/* Bench Section (FIFA Style) */}
                  <div className="p-8 bg-card border border-border backdrop-blur-xl rounded-[3rem]">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Substitutes Bench</h3>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest animate-pulse">Select player to swap</p>
                     </div>
                     <div className="flex flex-wrap justify-center gap-6">
                        {benchPlayers.map((p: any) => (
                           <div 
                              key={p.playerID}
                              onClick={() => handlePlayerClick(p, 'bench')}
                              className="cursor-pointer"
                           >
                              <PlayerBubble 
                                 player={p} 
                                 isSelected={selectedPlayer?.playerID === p.playerID}
                              />
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredPlayers.map((p: any) => {
                      const pStats = Array.isArray(p.stat) ? p.stat : [];
                      return (
                        <motion.div 
                          layout="position"
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 20 }}
                          transition={{ duration: 0.2 }}
                          key={p.playerID} 
                          className="p-4 bg-card border border-border rounded-2xl flex items-center gap-4 hover:bg-accent transition-colors"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border border-border relative">
                            <SafeImage 
                              src={p.playerPhoto} 
                              alt={p.playerFullName || p.fullName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-black uppercase italic tracking-tight">{p.playerFullName || p.fullName}</p>
                             <div className="flex items-center gap-3 mt-1">
                                 <p className="text-[10px] text-muted-foreground font-bold uppercase">{p.position}</p>
                                <div className="h-3 w-px bg-border" />
                                <div className="flex gap-2">
                                   <button 
                                      onClick={(e) => {
                                         e.stopPropagation();
                                         handleAddToWatchlist(p);
                                      }}
                                      className={`transition-all ${watchlistStatus[String(p.playerID)] ? 'text-emerald-500 scale-125' : 'text-muted-foreground hover:text-yellow-500'}`}
                                   >
                                      {watchlistStatus[String(p.playerID)] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                                   </button>
                                   <button 
                                      onClick={(e) => {
                                         e.stopPropagation();
                                         router.push(`/compare?p1=${p.playerID}`);
                                      }}
                                      className="text-muted-foreground hover:text-blue-500 transition-colors"
                                   >
                                      <ArrowRightLeft className="w-3.5 h-3.5" />
                                   </button>
                                </div>
                             </div>
                          </div>
                          <div className="flex gap-4 text-right">
                             <div>
                                <p className="text-[8px] font-black text-muted-foreground uppercase">Goals</p>
                                <p className="text-sm font-black text-emerald-500">{getPVal(pStats, ['Goals', 'Goal'])}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-muted-foreground uppercase">Ast</p>
                                <p className="text-sm font-black text-blue-500">{getPVal(pStats, ['Assist', 'Assists'])}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-muted-foreground uppercase">Apps</p>
                                <p className="text-sm font-black text-foreground">{getPVal(pStats, ['played', 'Appearances'])}</p>
                             </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
               </div>
            )}
         </div>

         {/* Information Panel (Right Column) */}
         <div className="lg:col-span-1 space-y-8">
            {/* Logo at the top right of this column */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="relative p-8 bg-card border border-border flex items-center justify-center group overflow-hidden shadow-2xl rounded-[3rem]"
            >
               <div className="absolute inset-0 bg-emerald-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <img 
                  src={teamDetails.teamLogo} 
                  alt={teamDetails.teamName}
                  className="w-full h-32 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:scale-110 transition-transform duration-500"
               />
            </motion.div>

            {/* Club Identity */}
            <div className="space-y-4">
               <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none">
                  {teamDetails.teamName}
               </h1>
               <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                     <span className="px-3 py-1 bg-emerald-500 text-black text-[8px] font-black uppercase tracking-widest rounded">PROFESSIONAL</span>
                     <span className="px-3 py-1 bg-muted text-muted-foreground text-[8px] font-black uppercase tracking-widest rounded border border-border">CLUB</span>
                  </div>
                  <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-emerald-500" />
                     {teamDetails.venueName || "Santiago Bernabéu Stadium"}
                  </p>
               </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <StatCard 
                  icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                  label="Rank"
                  value={standing?.rank ? `#${standing.rank}` : "#2"}
               />
               <StatCard 
                  icon={<Award className="w-4 h-4 text-purple-500" />}
                  label="Form."
                  value={teamDetails.formation || "4-4-2"}
               />
               <StatCard 
                  icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                  label="Points"
                  value={standing?.points || "73"}
               />
               <StatCard 
                  icon={<Users className="w-4 h-4 text-blue-500" />}
                  label="Squad"
                  value={allPlayers.length}
               />
            </div>

            {/* Competition Card */}
            <div className="p-6 bg-card border border-border backdrop-blur-xl rounded-3xl">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Competition Data</h3>
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 p-3 bg-muted rounded-2xl border border-border">
                     <img src={leagueInfo?.logo} className="w-full h-full object-contain" alt="" />
                  </div>
                  <div>
                     <p className="text-lg font-black uppercase tracking-tight leading-none mb-1">{leagueInfo?.name || "La Liga"}</p>
                     <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Active Season</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Played</p>
                        <p className="text-2xl font-black italic">{standing?.played || 0}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-500 uppercase mb-1">Perf. Score</p>
                        <p className="text-2xl font-black italic text-emerald-400">
                           {standing?.played ? ((standing.points / (standing.played * 3)) * 100).toFixed(1) : "0"}%
                        </p>
                     </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${standing?.played ? (standing.points / (standing.played * 3)) * 100 : 0}%` }}
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                     />
                  </div>
               </div>
            </div>

            {/* Squad Depth Analysis */}
            <div className="p-8 bg-card border border-border rounded-3xl space-y-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Squad Composition
               </h3>
               
               <div className="space-y-4">
                  <DepthRow label="Goalkeepers" count={gks.length} color="bg-yellow-500" />
                  <DepthRow label="Defenders" count={dfs.length} color="bg-blue-500" />
                  <DepthRow label="Midfielders" count={mfs.length} color="bg-emerald-500" />
                  <DepthRow label="Forwards" count={fws.length} color="bg-red-500" />
               </div>
            </div>

         </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="p-4 bg-card border border-border hover:bg-accent transition-colors rounded-2xl">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-black italic tracking-tighter text-foreground">{value}</p>
    </div>
  );
}

function DepthRow({ label, count, color }: { label: string, count: number, color: string }) {
   return (
      <div className="space-y-1">
         <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-foreground">{count}</span>
         </div>
         <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${(count / 15) * 100}%` }}
               className={`h-full ${color}`}
            />
         </div>
      </div>
   );
}

function TacticalField({ players, formation, onPlayerClick, selectedId }: { 
   players: any[], 
   formation: string, 
   onPlayerClick: (p: any) => void,
   selectedId?: string 
}) {
   const formationParts = (formation || "4-4-2").split('-').map(n => parseInt(n));
   const hasValidFormation = formationParts.length >= 3 && formationParts.reduce((a, b) => a + b, 0) === 10;
   const rows = hasValidFormation ? formationParts : [4, 4, 2];

   // Position Priority for sorting (Top to Bottom)
   const getPosPriority = (pos: string) => {
      const p = pos?.toUpperCase() || '';
      if (['FW', 'ST', 'RW', 'LW'].includes(p)) return 0;
      if (['MF', 'CAM', 'CDM', 'CM'].includes(p)) return 1;
      if (['DF', 'CB', 'LB', 'RB'].includes(p)) return 2;
      if (p === 'GK') return 3;
      return 4;
   };

   // Sort players so that FWs come first (for slice(0, fwCount)) and GK comes last
   const sortedPlayers = [...players].sort((a, b) => getPosPriority(a.position) - getPosPriority(b.position));
   
   return (
      <div className="h-full flex flex-col justify-between py-10 px-4 relative z-10">
         {/* Top Row (Forwards) */}
         <div className="flex justify-around items-center h-20">
            {sortedPlayers.slice(0, rows[2] || 2).map((p) => (
               <div key={p.playerID} onClick={() => onPlayerClick(p)}>
                  <PlayerBubble player={p} position="top" isSelected={selectedId === p.playerID} />
               </div>
            ))}
         </div>

         {/* Middle Row (Midfielders) */}
         <div className="flex justify-around items-center h-20">
            {sortedPlayers.slice(rows[2], (rows[2] || 2) + (rows[1] || 4)).map((p) => (
               <div key={p.playerID} onClick={() => onPlayerClick(p)}>
                  <PlayerBubble player={p} isSelected={selectedId === p.playerID} />
               </div>
            ))}
         </div>

         {/* Defensive Row (Defenders) */}
         <div className="flex justify-around items-center h-20">
            {sortedPlayers.slice((rows[2] || 2) + (rows[1] || 4), 10).map((p) => (
               <div key={p.playerID} onClick={() => onPlayerClick(p)}>
                  <PlayerBubble player={p} isSelected={selectedId === p.playerID} />
               </div>
            ))}
         </div>

         {/* Goal Row (GK) */}
         <div className="flex justify-center items-center h-20">
            {sortedPlayers.slice(10, 11).map((p) => (
               <div key={p.playerID} onClick={() => onPlayerClick(p)}>
                  <PlayerBubble player={p} isSelected={selectedId === p.playerID} />
               </div>
            ))}
         </div>
      </div>
   );
}

function PlayerBubble({ player, position, isSelected }: { player: any, position?: 'top' | 'bottom', isSelected?: boolean }) {
   const [isHovered, setIsHovered] = useState(false);
   
   // Robust Stat Extraction for Statorium API Structure
   const rawStats = Array.isArray(player.stat) ? player.stat : [];
   
   const getSum = (arr: any[], keys: string[]) => {
      return arr.reduce((acc, s) => {
         let val = 0;
         for (const k of keys) {
            const actualKey = Object.keys(s).find(sk => sk.toLowerCase() === k.toLowerCase());
            if (actualKey) { val = parseInt(s[actualKey]) || 0; break; }
         }
         return acc + val;
      }, 0);
   };

   const goals = getSum(rawStats, ['Goals', 'Goal']);
   const assists = getSum(rawStats, ['Assist', 'Assists']);
   const apps = getSum(rawStats, ['played', 'Appearances']);

   const showBelow = position === 'top';

   return (
      <div className={`relative flex flex-col items-center gap-2 ${isHovered || isSelected ? 'z-[100]' : 'z-10'}`}>
         <motion.div 
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ y: -10, scale: 1.1 }}
            className={`relative group/bubble cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110' : ''}`}
         >
            {/* Selection Glow */}
            {isSelected && (
               <div className="absolute inset-[-8px] bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
            )}
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover/bubble:opacity-100 transition-opacity" />
            <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-card border-2 transition-all duration-300 overflow-hidden shadow-xl relative z-10 ${isSelected ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.6)] scale-110' : 'border-border group-hover/bubble:border-white/80 group-hover/bubble:shadow-[0_0_20px_rgba(255,255,255,0.3)]'}`}>
               <SafeImage 
                  src={player.playerPhoto} 
                  alt={player.playerFullName || player.fullName} 
                  fill
                  sizes="64px"
                  className="object-cover"
               />
            </div>
            
            {/* Number Badge */}
            <div className={`absolute -bottom-1 -right-1 z-20 text-background text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-background transition-all duration-300 ${isSelected ? 'bg-foreground text-background scale-110' : 'bg-emerald-500 group-hover/bubble:scale-110 group-hover/bubble:bg-white group-hover/bubble:text-emerald-900'}`}>
               {player.playerNumber || "??"}
            </div>


            {/* Hover Tooltip (FIFA Detail View) */}
            <AnimatePresence>
               {(isHovered && !isSelected) && (
                  <motion.div 
                     initial={{ opacity: 0, y: showBelow ? -10 : 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: showBelow ? -10 : 10, scale: 0.95 }}
                     className={`absolute ${showBelow ? 'top-full mt-4' : 'bottom-full mb-4'} left-1/2 -translate-x-1/2 w-48 p-4 bg-zinc-950/95 backdrop-blur-xl border border-white/20 rounded-2xl z-[200] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.9)] pointer-events-none`}
                  >
                     <div className="text-center space-y-3">
                        <div className="pb-2 border-b border-white/10">
                           <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Technical Profile</p>
                           <p className="text-sm font-black italic uppercase leading-tight text-white">{player.playerFullName || player.fullName}</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1">
                           <div className="text-center">
                              <p className="text-[7px] font-bold text-zinc-500 uppercase">Matches</p>
                              <p className="text-xs font-black text-white">{apps}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[7px] font-bold text-emerald-500 uppercase">Goals</p>
                              <p className="text-xs font-black text-emerald-400">{goals}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[7px] font-bold text-blue-500 uppercase">Assists</p>
                              <p className="text-xs font-black text-blue-400">{assists}</p>
                           </div>
                        </div>
                     </div>
                     
                     {/* Triangle Arrow */}
                     <div className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-8 border-transparent ${showBelow ? 'bottom-full border-b-zinc-950/95' : 'top-full border-t-zinc-950/95'}`} />
                  </motion.div>
               )}
            </AnimatePresence>
         </motion.div>

         <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-tight whitespace-nowrap drop-shadow-md">
               {player.playerFullName?.split(' ').pop()}
            </p>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{player.position}</p>
         </div>
      </div>
   );
}
