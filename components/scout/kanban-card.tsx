'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import Image from 'next/image'

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
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all shadow-sm"
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full overflow-hidden border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 relative">
            <Image 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=047857&color=fff&size=80`} 
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 space-y-0.5">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-50 leading-none truncate">{item.name}</h4>
            <p className="text-[10px] text-zinc-500 truncate font-medium uppercase tracking-wider">
              {item.club} • {item.position}
            </p>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-transparent text-[10px] h-5 tabular-nums font-bold">
            {item.score}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
