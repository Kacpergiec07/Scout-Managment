'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
        className="h-[100px] rounded-lg border-2 border-dashed border-emerald-500/50 bg-zinc-900/50" 
      />
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors"
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h4 className="font-semibold text-zinc-50 leading-none">{item.name}</h4>
            <p className="text-xs text-zinc-500">{item.club} • {item.position}</p>
          </div>
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-transparent text-[10px] h-5">
            {item.score}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
