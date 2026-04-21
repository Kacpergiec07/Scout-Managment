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
import { StatoriumPlayerBasic } from '@/lib/statorium/types'
import { useDebounce } from 'use-debounce'
import { useRouter } from 'next/navigation'
<<<<<<< HEAD
import { MarketValue } from './market-value'
=======
>>>>>>> d6b4363621fd8fde6374b3f9a22b408083280f57
import Image from 'next/image'

export interface PlayerSearchProps {
  onSelect?: (player: StatoriumPlayerBasic) => void
  placeholder?: string
}

export function PlayerSearch({ onSelect, placeholder }: PlayerSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [query, setQuery] = React.useState('')
  const [debouncedQuery] = useDebounce(query, 500)
  const [results, setResults] = React.useState<StatoriumPlayerBasic[]>([])
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    async function search() {
      if (debouncedQuery.length < 3) {
        setResults([])
        return
      }
      setLoading(true)
      try {
        const data = await searchPlayersAction(debouncedQuery)
        setResults(data)
      } catch (err) {
        console.error(`Search error:`, err)
      } finally {
        setLoading(false)
      }
    }
    search()
  }, [debouncedQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all border-dashed"
        >
          <div className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4 opacity-50" />
            {value ? results.find((r) => r.playerID === value)?.fullName : placeholder || 'Search players from Statorium...'}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden rounded-xl">
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput 
            placeholder="Type player name (min 3 chars)..." 
            onValueChange={setQuery}
            className="text-zinc-900 dark:text-zinc-50 border-none focus:ring-0"
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {loading && <div className="p-4 text-sm text-zinc-500 text-center animate-pulse">Searching global database...</div>}
            {!loading && debouncedQuery.length >= 3 && results.length === 0 && (
              <CommandEmpty className="p-4 text-sm text-zinc-500 text-center">No players found matching "{debouncedQuery}"</CommandEmpty>
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
                  className="p-2 gap-3 text-zinc-700 dark:text-zinc-300 aria-selected:bg-emerald-500/10 dark:aria-selected:bg-emerald-500/10 aria-selected:text-emerald-600 dark:aria-selected:text-emerald-400 cursor-pointer"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    <Image 
                      src={player.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.fullName)}&background=047857&color=fff&size=100`} 
                      alt={player.fullName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-sm truncate">{player.fullName}</span>
                    <span className="text-[10px] opacity-70 uppercase tracking-widest truncate font-medium">
                      {typeof player.country === 'object' ? (player.country as any).name : player.country || 'International'} • {player.teamName || 'Free Agent'}
                    </span>
<<<<<<< HEAD
                    <MarketValue playerName={player.fullName} showIcon={false} className="scale-75 origin-left h-4 mt-0.5" />
=======
>>>>>>> d6b4363621fd8fde6374b3f9a22b408083280f57
                  </div>
                  <Check
                    className={cn(
                      'h-4 w-4 text-emerald-500 transition-opacity',
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
