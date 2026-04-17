import { getTeamDetailsAction } from "@/app/actions/statorium";
<<<<<<< HEAD
import { notFound } from "next/navigation";
import { TeamContent } from "./team-content";

export default async function TeamPage({
  params,
  searchParams
}: {
=======
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, Trophy, Shield, ArrowLeft, UserCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TacticalPitch } from "@/components/scout/tactical-pitch";
import { SquadRow } from "@/components/scout/squad-row";

export default async function TeamPage({ 
  params,
  searchParams
}: { 
>>>>>>> 0fced7fac57a646d79d15a5adebe45adaee32fbd
  params: Promise<{ id: string }>,
  searchParams: Promise<{ seasonId?: string }>
}) {
  const { id } = await params;
  const { seasonId } = await searchParams;
  const team = await getTeamDetailsAction(id, seasonId);

  if (!team) {
    notFound();
  }

<<<<<<< HEAD
  return <TeamContent team={team} />;
=======
  // Determine formation from squad positions
  const squad = team.players || [];
  const countPosition = (pos: string) => squad.filter(p => p.position?.startsWith(pos) || p.additionalInfo?.position?.startsWith(pos)).length || 0;
  const defendersCount = countPosition('DF') || countPosition('Def');
  const midfieldersCount = countPosition('MF') || countPosition('Mid');
  const forwardsCount = countPosition('FW') || countPosition('Atack');

  // Advanced formation detection based on squad density or API
  let formationText = team.formation ? `${team.formation} FROM API` : "4-3-3 ATTACKING";
  let formationLayout = { d: 4, m: 3, f: 3 };

  if (team.formation) {
    const parts = team.formation.split('-').map(Number);
    if (parts.length === 3) {
      formationLayout = { d: parts[0], m: parts[1], f: parts[2] };
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

  // Assign players to formation nodes
  // Assign players to formation nodes using the server-calculated starting XI (first 11)
  const startingXI = squad.slice(0, 11);
  const subs = squad.slice(11);
  
  const pgks = startingXI.filter(p => p.position?.startsWith('GK') || p.additionalInfo?.position?.startsWith('Goalkeep'));
  const pdfs = startingXI.filter(p => p.position?.startsWith('DF') || p.additionalInfo?.position?.startsWith('Def'));
  const pmfs = startingXI.filter(p => p.position?.startsWith('MF') || p.additionalInfo?.position?.startsWith('Mid'));
  const pfws = startingXI.filter(p => p.position?.startsWith('FW') || p.additionalInfo?.position?.startsWith('Atac'));

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
        <Card className="lg:col-span-2 border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
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
                    {startingXI.length > 0 ? startingXI.map((player) => (
                      <SquadRow key={player.playerID} player={player} starting />
                    )) : <EmptySquad />}
                  </div>
                </TabsContent>
                <TabsContent value="subs" className="m-0">
                  <div className="divide-y divide-white/5">
                    {subs.length > 0 ? subs.map((player) => (
                      <SquadRow key={player.playerID} player={player} />
                    )) : <EmptySquad />}
                  </div>
                </TabsContent>
              </ScrollArea>
            </CardContent>
          </Tabs>
        </Card>

        {/* Formation & Tactics */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden flex flex-col">
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
                <span className="text-white/40 uppercase font-black tracking-widest">Formation (Derived)</span>
                <span className="text-primary font-bold uppercase p-1.5 bg-primary/10 rounded-lg border border-primary/20">{formationText}</span>
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

function EmptySquad() {
  return (
    <div className="p-20 text-center space-y-4">
      <Users className="w-12 h-12 mx-auto text-white/10" />
      <p className="text-xs text-white/20 italic">No players found in this category.</p>
    </div>
  )
>>>>>>> 0fced7fac57a646d79d15a5adebe45adaee32fbd
}
