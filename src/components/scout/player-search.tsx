'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search as SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { searchPlayersAction } from '@/app/actions/statorium'
import { getPlayerScoutingHintsAction } from '@/app/actions/scouting-hints'
import { StatoriumPlayerBasic } from '@/lib/statorium/types'
import { useDebounce } from 'use-debounce'
import { useRouter } from 'next/navigation'
import { MarketValue } from './market-value'
import Image from 'next/image'
import { Sparkles, Loader2 } from 'lucide-react'

export interface PlayerSearchProps {
  onSelect?: (player: StatoriumPlayerBasic) => void
  placeholder?: string
  initialQuery?: string
  context?: {
    position: string
    requirements: string[]
  }
}

export function PlayerSearch({ onSelect, placeholder, initialQuery = '', context }: PlayerSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [query, setQuery] = React.useState(initialQuery)
  const [debouncedQuery] = useDebounce(query, 500)
  const [results, setResults] = React.useState<StatoriumPlayerBasic[]>([])
  const [loading, setLoading] = React.useState(false)
  const [hints, setHints] = React.useState<Record<string, string>>({})
  const [hintsLoading, setHintsLoading] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    async function search() {
      if (debouncedQuery.length < 2) {
        setResults([])
        setHints({})
        return
      }
      setLoading(true)
      try {
        const data = await searchPlayersAction(debouncedQuery)
        setResults(data)
        
        // If we have context, fetch AI hints for the results
        if (context && data.length > 0) {
          setHintsLoading(true)
          const playersForHints = data.map(p => ({
            id: p.playerID,
            name: p.fullName,
            team: p.teamName || 'Free Agent',
            position: p.position || 'N/A'
          }))
          const aiHints = await getPlayerScoutingHintsAction(playersForHints, context)
          setHints(aiHints)
          setHintsLoading(false)
        }
      } catch (err) {
        console.error(`Search error:`, err)
      } finally {
        setLoading(false)
      }
    }
    search()
  }, [debouncedQuery, context])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-muted border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-all border-dashed"
        >
          <div className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4 opacity-50" />
            {value ? results.find((r) => r.playerID === value)?.fullName : placeholder || 'Search players from Statorium...'}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border-border shadow-xl overflow-hidden rounded-xl">
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput 
            placeholder="Type player name (min 2 chars)..." 
            value={query}
            onValueChange={setQuery}
            className="text-foreground border-none focus:ring-0"
          />
          <CommandList className="max-h-[400px] overflow-y-auto">
            {loading && <div className="p-4 text-sm text-muted-foreground text-center animate-pulse flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-secondary" />
              Searching local and global scouting databases...
            </div>}
            {!loading && debouncedQuery.length >= 2 && results.length === 0 && (
              <CommandEmpty className="p-4 text-sm text-muted-foreground text-center">No players found matching "{debouncedQuery}"</CommandEmpty>
            )}
            <CommandGroup>
              {results.map((player) => (
                <CommandItem
                  key={player.playerID}
                  value={player.fullName}
                  onSelect={() => {
                    setValue(player.playerID)
                    setOpen(false)
                    if (onSelect) {
                      onSelect(player)
                    } else {
                      router.push(`/analysis?id=${player.playerID}&name=${encodeURIComponent(player.fullName)}`)
                    }
                  }}
                  className="p-3 gap-3 text-foreground aria-selected:bg-secondary/10 aria-selected:text-secondary cursor-pointer border-b border-border/50 last:border-0"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted border border-border">
                    <Image 
                      src={player.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.fullName)}&background=047857&color=fff&size=100`} 
                      alt={player.fullName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm truncate">{player.fullName}</span>
                      <MarketValue playerName={player.fullName} showIcon={false} className="scale-90 origin-right" />
                    </div>
                    <div className="flex items-center gap-2 mt-1 min-w-0">
                      <div className="flex items-center gap-1 text-[10px] opacity-70 uppercase tracking-widest truncate font-medium">
                        <span className="shrink-0">{typeof player.country === 'object' ? (player.country as any).name : player.country || 'INT'}</span>
                        <span className="shrink-0">•</span>
                        <span className="truncate">{player.teamName || 'Free Agent'}</span>
                        <span className="shrink-0">•</span>
                        <span className="shrink-0">{player.position || 'N/A'}</span>
                      </div>
                    </div>
                    
                    {/* AI Scouting Hint */}
                    {context && (
                      <div className="mt-2 p-2 rounded-lg bg-secondary/10 border border-secondary/20 relative overflow-hidden group/hint shadow-inner">
                        <div className="absolute top-0 right-0 p-1 opacity-20 group-hover/hint:opacity-50 transition-opacity">
                          <Sparkles className="h-3 w-3 text-secondary" />
                        </div>
                        {hintsLoading && !hints[player.playerID] ? (
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground animate-pulse font-medium">
                            <Loader2 className="h-3 w-3 animate-spin text-secondary" />
                            AI is analyzing tactical fit...
                          </div>
                        ) : hints[player.playerID] ? (
                          <div className="flex items-start gap-2 text-[11px] text-secondary-foreground leading-snug font-medium">
                            <span className="shrink-0 mt-0.5 px-1 py-0.5 rounded-sm bg-secondary text-secondary-foreground text-[8px] font-black uppercase">AI Match</span>
                            <span>{hints[player.playerID]}</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <Check
                    className={cn(
                      'h-4 w-4 text-secondary transition-opacity',
                      value === player.playerID ? 'opacity-100' : 'opacity-0'
                    )}
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
