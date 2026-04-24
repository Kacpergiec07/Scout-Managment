'use client'

import * as React from 'react'
import { useHomeTeam, HomeTeam } from '@/hooks/use-home-team'
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList 
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Check, ChevronsUpDown, Shield, Star } from 'lucide-react'
import { LEAGUES } from '@/lib/statorium-data'
import { getStandingsAction } from '@/app/actions/statorium'
import Image from 'next/image'

export function HomeTeamSelector() {
  const { homeTeam, selectHomeTeam, isLoaded } = useHomeTeam()
  const [open, setOpen] = React.useState(false)
  const [allTeams, setAllTeams] = React.useState<HomeTeam[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    async function loadAllTeams() {
      setLoading(true)
      try {
        const teamPromises = LEAGUES.map(league => getStandingsAction(league.seasonId))
        const standings = await Promise.all(teamPromises)
        const teams: HomeTeam[] = standings.flat().map((team: any) => ({
          id: team.teamID,
          name: team.teamName,
          logo: team.teamLogo,
          seasonId: team.seasonID // Statorium standing row usually has seasonID or we can infer it
        }))
        
        // Remove duplicates and empty team names
        const uniqueTeams = teams.filter((team, index, self) => 
          team.name && index === self.findIndex((t) => t.id === team.id)
        )
        
        setAllTeams(uniqueTeams)
      } catch (e) {
        console.error('Failed to load teams for selector', e)
      } finally {
        setLoading(false)
      }
    }

    if (open && allTeams.length === 0) {
      loadAllTeams()
    }
  }, [open, allTeams.length])

  if (!isLoaded) return <div className="h-10 w-40 animate-pulse bg-accent rounded-lg" />

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[240px] justify-between border-2 border-primary/20 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-all"
        >
          {homeTeam ? (
            <div className="flex items-center gap-2 truncate">
              {homeTeam.logo && (
                <div className="relative h-5 w-5 shrink-0">
                  <Image src={homeTeam.logo} alt={homeTeam.name} fill className="object-contain" />
                </div>
              )}
              <span className="truncate font-bold text-xs uppercase tracking-wider">{homeTeam.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select My Team</span>
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0 border-2 border-primary/20 bg-card/95 backdrop-blur-xl">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search teams..." className="h-9 border-none focus:ring-0" />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup>
              {allTeams.map((team) => (
                <CommandItem
                  key={team.id}
                  value={team.name}
                  onSelect={() => {
                    selectHomeTeam(team)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-6">
                      <Image src={team.logo} alt={team.name} fill className="object-contain" />
                    </div>
                    <span className="font-bold text-xs uppercase">{team.name}</span>
                  </div>
                  <Check
                    className={`h-4 w-4 text-primary ${
                      homeTeam?.id === team.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
