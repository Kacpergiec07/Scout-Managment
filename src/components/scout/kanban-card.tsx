'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import Link from 'next/link'
import Image from 'next/image'
import { MarketValue } from './market-value'
import { GripVertical } from 'lucide-react'

export function KanbanCard({ item }: { item: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="h-[100px] rounded-xl border-2 border-dashed border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10" 
      />
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="group relative border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm overflow-hidden"
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center text-zinc-300 dark:text-zinc-700 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all z-20"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <Link 
        href={`/analysis?id=${item.id}&name=${encodeURIComponent(item.name)}&desc=${encodeURIComponent(item.description || '')}&photo=${encodeURIComponent(item.playerPhoto || '')}&club=${encodeURIComponent(item.club || '')}&pos=${encodeURIComponent(item.position || '')}&nation=${encodeURIComponent(item.nationality || '')}&league=${encodeURIComponent(item.league || '')}`} 
        className="block pl-8 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-all relative z-10 cursor-pointer"
      >
        <div className="space-y-3">
          <div className="flex justify-between items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 relative">
              <Image 
                src={item.playerPhoto || `https://api.statorium.com/media/bearleague/bl${item.id}.webp`} 
                alt={item.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 leading-none truncate mb-1">{item.name}</h4>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                  {item.position}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium truncate">
                  {item.club}
                </span>
              </div>
              {item.description && (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed italic border-l-2 border-emerald-500/20 pl-2">
                  "{item.description}"
                </p>
              )}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] text-zinc-400 font-mono">
                  ID:{item.id.padStart(4, '0')}
                </span>
                {item.updatedAt && (
                  <span className="text-[9px] text-zinc-500 font-medium bg-zinc-100 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded-full">
                    Updated: {item.updatedAt}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent text-[10px] h-5 tabular-nums font-bold">
                {item.score}%
              </Badge>
              <MarketValue playerName={item.name} showIcon={false} className="scale-75 origin-right" />
            </div>
          </div>
        </div>
      </Link>
    </Card>
  )
}
