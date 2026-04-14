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

export function PlayerSearch() {
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
      console.log(`Searching for: ${debouncedQuery}`)
      try {
        const data = await searchPlayersAction(debouncedQuery)
        console.log(`Results found:`, data)
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
          className="w-full justify-between bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-50"
        >
          {value ? results.find((r) => r.playerID === value)?.fullName : 'Search players from Statorium...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-zinc-900 border-zinc-800">
        <Command shouldFilter={false} className="bg-transparent">
          <CommandInput 
            placeholder="Type player name (min 3 chars)..." 
            onValueChange={setQuery}
            className="text-zinc-50"
          />
          <CommandList>
            {loading && <div className="p-4 text-sm text-zinc-500 text-center">Searching...</div>}
            {!loading && debouncedQuery.length >= 3 && results.length === 0 && (
              <CommandEmpty className="p-4 text-sm text-zinc-500">No players found.</CommandEmpty>
            )}
            <CommandGroup>
              {results.map((player) => (
                <CommandItem
                  key={player.playerID}
                  value={player.fullName} // Changed value to fullName to avoid cmdk internal filtering
                  onSelect={() => {
                    setValue(player.playerID)
                    setOpen(false)
                    router.push(`/analysis?id=${player.playerID}&name=${encodeURIComponent(player.fullName)}`)
                  }}
                  className="text-zinc-300 aria-selected:bg-zinc-800 aria-selected:text-zinc-50"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === player.playerID ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {player.fullName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
