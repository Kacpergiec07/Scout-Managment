'use client'

import * as React from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'

const COLUMNS = [
  { id: 'following', title: 'Following' },
  { id: 'priority', title: 'Priority' },
  { id: 'analyzing', title: 'Analyzing' },
  { id: 'complete', title: 'Done' },
]

export function KanbanBoard({ initialData }: { initialData: any[] }) {
  const [items, setItems] = React.useState<any>(initialData)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeColumn = active.data.current?.sortable.containerId
    const overColumn = over.data.current?.sortable.containerId || over.id

    if (activeColumn !== overColumn) {
      setItems((prev: any) => {
        const activeItems = [...prev[activeColumn]]
        const overItems = [...prev[overColumn]]
        
        const activeIndex = activeItems.findIndex(i => i.id === active.id)
        const [movedItem] = activeItems.splice(activeIndex, 1)
        
        overItems.push(movedItem)
        
        return {
          ...prev,
          [activeColumn]: activeItems,
          [overColumn]: overItems
        }
      })
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null)
    // Next: Persist to Supabase
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            items={items[col.id] || []}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeId ? (
          <div className="opacity-80">
            {/* Find item across all columns */}
            {(() => {
              const item = Object.values(items).flat().find((i: any) => i.id === activeId)
              return item ? <KanbanCard item={item as any} /> : null
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
