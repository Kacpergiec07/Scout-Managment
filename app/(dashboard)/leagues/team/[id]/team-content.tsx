"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Trophy, Shield, ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";
import { TacticalPitch } from "@/components/scout/tactical-pitch";

interface TeamContentProps {
  team: any;
}

export function TeamContent({ team }: TeamContentProps) {
  // Handle hash navigation for scrolling to sections
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  // Determine formation from squad positions
  const squad = team.players || [];
  const countPosition = (prefix: string) => squad.filter((p: any) => {
    const pos = p.position || p.additionalInfo?.position || '';
    return pos.startsWith(prefix);
  }).length || 0;
  const defendersCount = countPosition('DF') || countPosition('Def');
  const midfieldersCount = countPosition('MF') || countPosition('Mid');
  const forwardsCount = countPosition('FW') || countPosition('For') || countPosition('Ata');

  // Parse formation from API or use fallback
  let formationText = team.formation || "4-3-3 STANDARD";
  let formationLayout = { d: 4, m: 3, f: 3 };

  // Parse formation string (e.g., "4-3-3 ATTACKING" -> { d: 4, m: 3, f: 3 })
  if (team.formation) {
    const parts = team.formation.split('-');
    if (parts.length >= 3) {
      formationLayout = {
        d: parseInt(parts[0]) || 4,
        m: parseInt(parts[1]) || 3,
        f: parseInt(parts[2]) || 3
      };
    }
  } else {
    // Fallback heuristic based on player counts if data allows
    if (defendersCount >= 5) {
      formationText = "5-3-2 DEFENSIVE";
      formationLayout = { d: 5, m: 3, f: 2 };
    } else if (midfieldersCount >= 5 && forwardsCount <= 1) {
      formationText = "4-2-3-1 MODERN";
      formationLayout = { d: 4, m: 5, f: 1 };
    } else if (forwardsCount >= 2 && midfieldersCount >= 4) {
      formationText = "4-4-2 CLASSIC";
      formationLayout = { d: 4, m: 4, f: 2 };
    } else if (defendersCount === 3) {
      formationText = "3-4-3 OFFENSIVE";
      formationLayout = { d: 3, m: 4, f: 3 };
    } else {
      formationText = "4-3-3 ATTACKING";
      formationLayout = { d: 4, m: 3, f: 3 };
    }
  }

  // Strip style suffix from formation for display (e.g., "4-3-3 ATTACKING" -> "4-3-3")
  const displayFormation = formationText.split(' ').slice(0, -1).join('-') || formationText.split(' ')[0] || "4-3-3";

  // Assign players to formation nodes
  // Assign players to formation nodes using the server-calculated starting XI (first 11)
  const startingXI = squad.slice(0, 11);
  const subs = squad.slice(11);

  const pgks = startingXI.filter((p: any) => {
    const pos = p.position || p.additionalInfo?.position || '';
    return pos.startsWith('GK') || pos.startsWith('Goal');
  });
  const pdfs = startingXI.filter((p: any) => {
    const pos = p.position || p.additionalInfo?.position || '';
    return pos.startsWith('DF') || pos.startsWith('Def');
  });
  const pmfs = startingXI.filter((p: any) => {
    const pos = p.position || p.additionalInfo?.position || '';
    return pos.startsWith('MF') || pos.startsWith('Mid');
  });
  const pfws = startingXI.filter((p: any) => {
    const pos = p.position || p.additionalInfo?.position || '';
    return pos.startsWith('FW') || pos.startsWith('Ata') || pos.startsWith('For');
  });

  const startingGK = pgks[0] || startingXI[0];
  const startingDF = pdfs;
  const startingMF = pmfs;
  const startingFW = pfws;

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link
        href="/leagues"
        className="flex items-center gap-2 text-white/40 hover:text-primary transition-colors mb-4 group w-fit"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to League Intelligence
      </Link>

      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 md:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] -ml-32 -mb-32" />

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-3xl flex items-center justify-center p-6 border border-white/10 shadow-2xl">
            {team.teamLogo ? (
              <img src={team.teamLogo} alt={team.teamName} className="object-contain w-full h-full drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
            ) : (
              <Shield className="w-20 h-20 text-white/10" />
            )}
          </div>

          <div className="text-center md:text-left space-y-4">
            <div className="space-y-1">
              <Badge className="bg-primary/20 text-primary border-primary/30 uppercase tracking-widest text-[10px] py-1 px-3">
                Professional Club
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
                {team.teamName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-white/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{team.city || 'Location Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{team.venueName || 'Home Stadium'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{squad.length} Professional Squad</span>
              </div>
              {team.coach && (
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Mgr: {team.coach}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Squad List */}
        <Card id="squad" className="lg:col-span-2 border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden scroll-mt-8">
          <Tabs defaultValue="starting" className="w-full">
            <CardHeader className="bg-white/5 border-b border-white/10 flex flex-row items-center justify-between py-4">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2 uppercase tracking-tighter font-black">
                  <Users className="w-5 h-5 text-primary" />
                  Squad Roster
                </CardTitle>
              </div>
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="starting" className="text-xs data-[state=active]:bg-primary">Starting XI</TabsTrigger>
                <TabsTrigger value="subs" className="text-xs data-[state=active]:bg-primary">Substitutes</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[550px]">
                <TabsContent value="starting" className="m-0">
                  <div className="divide-y divide-white/5">
                    {startingXI.length > 0 ? startingXI.map((player: any) => (
                      <SquadRow key={player.playerID} player={player} starting />
                    )) : <EmptySquad />}
                  </div>
                </TabsContent>
                <TabsContent value="subs" className="m-0">
                  <div className="divide-y divide-white/5">
                    {subs.length > 0 ? subs.map((player: any) => (
                      <SquadRow key={player.playerID} player={player} />
                    )) : <EmptySquad />}
                  </div>
                </TabsContent>
              </ScrollArea>
            </CardContent>
          </Tabs>
        </Card>

        {/* Formation & Tactics */}
        <Card id="tactics" className="border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden flex flex-col scroll-mt-8">
          <CardHeader className="bg-white/5 border-b border-white/10">
            <CardTitle className="text-base flex items-center gap-2 uppercase tracking-tighter font-black">
              <Shield className="w-4 h-4 text-primary" />
              Tactical Alignment
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-6 flex flex-col items-center justify-center space-y-8">
            <div className="w-full flex items-center justify-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/10 mb-2">
              <UserCircle className="w-6 h-6 text-primary" />
              <div className="text-center">
                <p className="text-[10px] text-white/40 uppercase font-black tracking-widest leading-none mb-1">Manager / Head Coach</p>
                <p className="text-lg font-black text-white">{team.coach || 'Technical Staff'}</p>
              </div>
            </div>

            <TacticalPitch startingXI={startingXI} allPlayers={squad} formationLayout={formationLayout} />

            <div className="w-full space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40 uppercase font-black tracking-widest">Formation (Calculated)</span>
                <span className="text-primary font-bold uppercase p-1.5 bg-primary/10 rounded-lg border border-primary/20">{displayFormation}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 shadow-lg">
                <p className="text-[10px] text-white/50 leading-relaxed italic text-center">
                  Najeź na punkty na boisku, aby zobaczyć zawodników przypisanych do pozycji. System automatycznie dopasował {startingXI.length} graczy do pierwszej jedenastki.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getShortPos(p: any) {
  const pos = p.position || p.additionalInfo?.position || '';
  if (pos.startsWith('GK') || pos.startsWith('Goal')) return 'GK';
  if (pos.startsWith('DF') || pos.startsWith('Def')) return 'DF';
  if (pos.startsWith('MF') || pos.startsWith('Mid')) return 'MF';
  if (pos.startsWith('FW') || pos.startsWith('Ata') || pos.startsWith('For')) return 'FW';
  return 'N/A';
}

function SquadRow({ player, starting }: { player: any, starting?: boolean }) {
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
          <p className="text-[10px] text-white/30 uppercase tracking-widest">{player.country?.name || player.country || 'N/A'}</p>
        </div>
      </div>
      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
        Analyze
      </Badge>
    </Link>
  )
}

function EmptySquad() {
  return (
    <div className="p-20 text-center space-y-4">
      <Users className="w-12 h-12 mx-auto text-white/10" />
      <p className="text-xs text-white/20 italic">No players found in this category.</p>
    </div>
  )
}

function PlayerNode({ player, pulse, pos }: { player?: any, pulse?: boolean, pos?: string }) {
  return (
    <div className="relative group/node flex flex-col items-center">
      {/* Tooltip */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-lg opacity-0 group-hover/node:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl z-20 border border-white/20">
        <div className="flex flex-col items-center">
          <span className="uppercase text-[8px] opacity-70 mb-0.5">{pos || player?.position}</span>
          <span>{player?.fullName || 'Position Available'}</span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-primary" />
      </div>

      <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${player ? 'bg-primary' : 'bg-white/20'} shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-pointer transition-transform hover:scale-125 relative z-10 border-2 border-black`}>
        {pulse && <div className="absolute -inset-2 rounded-full border-2 border-primary animate-ping opacity-30" />}
      </div>

      {/* Visual indicator of player presence */}
      {!player && <div className="mt-2 w-1 h-1 rounded-full bg-white/10" />}
    </div>
  );
}
