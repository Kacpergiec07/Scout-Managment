'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Calendar, Users, Target, Shield, ChevronRight, Activity, Search } from 'lucide-react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LEAGUES } from '@/lib/statorium-data'
import { getLeagueHubDataAction, getTeamDetailsAction } from '@/app/actions/statorium'
import { TacticalPitch } from './tactical-pitch'
import { useRouter } from 'next/navigation'

export function LeagueTacticalHub() {
  const router = useRouter()
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[1]) // Default to PL
  const [standings, setStandings] = useState<any[]>([])
  const [fixtures, setFixtures] = useState<any[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [teamData, setTeamData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [teamLoading, setTeamLoading] = useState(false)

  useEffect(() => {
    async function loadLeagueData() {
      setLoading(true)
      try {
        const data = await getLeagueHubDataAction(selectedLeague.seasonId)
        setStandings(data.standings)
        setFixtures(data.fixtures)
        setSelectedTeamId(null)
        setTeamData(null)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadLeagueData()
  }, [selectedLeague])

  useEffect(() => {
    if (!selectedTeamId) return
    async function loadTeamData() {
      setTeamLoading(true)
      try {
        const data = await getTeamDetailsAction(selectedTeamId as string, selectedLeague.seasonId)
        setTeamData(data)
      } catch (e) {
        console.error(e)
      } finally {
        setTeamLoading(false)
      }
    }
    loadTeamData()
  }, [selectedTeamId, selectedLeague.seasonId])

  return (
    <div className="min-h-screen bg-background text-foreground p-6 lg:p-10 space-y-8 font-sans transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center border border-border shadow-2xl">
            <Trophy className="w-7 h-7 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">League Intelligence</h1>
            <p className="text-zinc-500 text-sm font-medium">Real-time standings, fixtures, and squad analysis.</p>
          </div>
        </div>

        <div className="flex bg-card/50 p-1 rounded-xl border border-border/50 backdrop-blur-sm overflow-x-auto max-w-full">
          {LEAGUES.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeague(league)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                selectedLeague.id === league.id 
                ? "bg-secondary text-secondary-foreground shadow-lg" 
                : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative w-5 h-3.5 shrink-0 overflow-hidden rounded-sm border border-border/20">
                <Image src={league.flag} alt="" fill className="object-cover" unoptimized />
              </div>
              {league.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Standings Table */}
        <div className="xl:col-span-7 space-y-6">
          <div className="bg-card/30 border border-border/50 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                {selectedLeague.name} Standings
              </h2>
              <Badge variant="outline" className="text-[10px] uppercase font-bold border-border text-muted-foreground">Season 2024/25</Badge>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] border-b border-border/30">
                    <th className="px-6 py-4 w-12">#</th>
                    <th className="px-4 py-4">Team</th>
                    <th className="px-4 py-4 text-center">P</th>
                    <th className="px-4 py-4 text-center">W</th>
                    <th className="px-4 py-4 text-center">D</th>
                    <th className="px-4 py-4 text-center">L</th>
                    <th className="px-4 py-4 text-center">GD</th>
                    <th className="px-6 py-4 text-right">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-6 py-4 h-14 bg-accent/10" />
                      </tr>
                    ))
                  ) : standings.map((team, idx) => (
                    <StandingRow
                      key={team.teamID}
                      team={team}
                      idx={idx}
                      isSelected={selectedTeamId === team.teamID}
                      onSelect={() => setSelectedTeamId(team.teamID)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-5 space-y-8">
          {/* Next Fixtures */}
          <div className="bg-card/30 border border-border/50 rounded-3xl overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                Next Fixtures
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-zinc-800/20 rounded-2xl animate-pulse" />
                ))
              ) : fixtures.length > 0 ? fixtures.map((match) => (
                <div key={match.matchID} className="p-4 rounded-2xl bg-accent/20 border border-border/30 flex items-center justify-between hover:border-accent transition-colors">
                  <div className="flex flex-col items-center gap-1 w-20">
                    <div className="w-10 h-10 relative">
                      <Image 
                        src={match.homeLogo}
                        alt="Home"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-center truncate w-full text-muted-foreground">
                      {match.homeParticipant?.participantName}
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded uppercase tracking-tighter mb-1">
                      {match.matchTime || 'TBD'}
                    </span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase">vs</span>
                    <span className="text-[8px] text-muted-foreground mt-1 font-bold">{match.matchDate}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1 w-20">
                    <div className="w-10 h-10 relative">
                      <Image 
                        src={match.awayLogo}
                        alt="Away"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-center truncate w-full text-muted-foreground">
                      {match.awayParticipant?.participantName}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest italic">No upcoming matches</div>
              )}
            </div>
          </div>

          {/* Squad Intelligence */}
          <div className="bg-card/30 border border-border/50 rounded-3xl overflow-hidden backdrop-blur-md h-fit">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                Squad Intelligence
              </h2>
              {teamData && (
                <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-widest">
                  Analyzing <span className="text-secondary">{teamData.teamName}</span> • Formation: {teamData.formation}
                </p>
              )}
            </div>
            <div className="p-8">
              {teamLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Activity className="w-8 h-8 text-secondary animate-pulse" />
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Decrypting Formation...</p>
                </div>
              ) : teamData ? (
                <div className="space-y-6">
                  <TacticalPitch 
                    startingXI={teamData.players.slice(0, 11)} 
                    allPlayers={teamData.players}
                    formationLayout={(() => {
                      const parts = (teamData.formation || "4-4-2").split('-').map(n => parseInt(n) || 0);
                      if (parts.length === 4) {
                        return { d: parts[0] || 4, m: (parts[1] + parts[2]) || 5, f: parts[3] || 1 };
                      }
                      return {
                        d: parts[0] || 4,
                        m: parts[1] || 4,
                        f: parts[2] || 2
                      };
                    })()}
                  />
                   <div className="flex items-center justify-between p-4 bg-card/50 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20">
                        <Shield className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">Team Manager</p>
                        <p className="text-xs font-bold text-foreground mt-1">{teamData.coach || 'Unassigned'}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => router.push(`/teams/${selectedTeamId}`)}
                      variant="ghost" 
                      size="sm" 
                      className="text-secondary hover:bg-secondary/5 text-[10px] font-black uppercase tracking-tighter"
                    >
                      Full Squad <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                   <div className="w-16 h-16 rounded-3xl bg-card flex items-center justify-center border border-border shadow-inner">
                    <Search className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sector Selection Required</p>
                    <p className="text-[10px] font-bold text-muted-foreground/50 uppercase mt-1 tracking-widest">Select a team from standings to view roster.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StandingRow = React.memo(({ team, idx, isSelected, onSelect }: any) => (
  <tr 
    onClick={onSelect}
    className={`group cursor-pointer transition-colors ${
      isSelected ? "bg-primary/5" : "hover:bg-zinc-800/20"
    }`}
  >
    <td className="px-6 py-5">
      <span className={`text-xs font-black ${
        idx < 4 ? "text-primary" : idx > 16 ? "text-red-500" : "text-zinc-500"
      }`}>
        {idx + 1}.
      </span>
    </td>
    <td className="px-4 py-5">
      <div className="flex items-center gap-4">
        <div className="relative w-8 h-8">
          <Image 
            src={team.teamLogo} 
            alt={team.teamName} 
            fill 
            className="object-contain"
            unoptimized
          />
        </div>
        <span className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
          {team.teamName}
        </span>
      </div>
    </td>
    <td className="px-4 py-5 text-center text-xs font-medium text-zinc-400">{team.played}</td>
    <td className="px-4 py-5 text-center text-xs font-medium text-zinc-400">{team.won}</td>
    <td className="px-4 py-5 text-center text-xs font-medium text-zinc-400">{team.drawn}</td>
    <td className="px-4 py-5 text-center text-xs font-medium text-zinc-400">{team.lost}</td>
    <td className="px-4 py-5 text-center text-xs font-medium text-zinc-400">{team.goalsFor - team.goalsAgainst}</td>
    <td className="px-6 py-5 text-right">
      <span className="text-sm font-black text-white">{team.points}</span>
    </td>
  </tr>
))

StandingRow.displayName = "StandingRow"
