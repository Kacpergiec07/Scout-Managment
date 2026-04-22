'use client'

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './kanban-card'

interface KanbanColumnProps {
  id: string
  title: string
  items: any[]
}

export function KanbanColumn({ id, title, items }: KanbanColumnProps) {
  const { setNodeRef } = useSortable({
    id: id,
    data: {
      type: 'Column',
    },
  })

  return (
    <div className="flex w-80 shrink-0 flex-col gap-4 rounded-xl bg-muted/30 p-4 border border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground">{title}</h3>
        <span className="rounded-lg bg-secondary px-2 py-0.5 text-xs text-muted-foreground border border-border">{items.length}</span>
      </div>
      
      <div ref={setNodeRef} className="flex flex-1 flex-col gap-3 min-h-[500px]">
        <SortableContext id={id} items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} />
          ))}
        </SortableContext>
      </div>
    </div>
  )
}
