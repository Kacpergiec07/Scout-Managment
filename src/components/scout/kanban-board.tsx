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
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function onDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function findContainer(id: string) {
    if (id in items) return id
    return Object.keys(items).find((key) => items[key].some((item: any) => item.id === id))
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event
    const overId = over?.id

    if (!overId || active.id in items) return

    const activeContainer = findContainer(active.id as string)
    const overContainer = findContainer(overId as string)

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return
    }

    setItems((prev: any) => {
      const activeItems = prev[activeContainer]
      const overItems = prev[overContainer]

      const activeIndex = activeItems.findIndex((i: any) => i.id === active.id)
      const overIndex = overItems.findIndex((i: any) => i.id === overId)

      let newIndex: number
      if (overId in prev) {
        newIndex = overItems.length + 1
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1
        const modifier = isBelowLastItem ? 1 : 0
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1
      }

      return {
        ...prev,
        [activeContainer]: prev[activeContainer].filter((item: any) => item.id !== active.id),
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          prev[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length)
        ]
      }
    })
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const overId = over?.id

    if (!overId) {
      setActiveId(null)
      return
    }

    const activeContainer = findContainer(active.id as string)
    const overContainer = findContainer(overId as string)

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const activeIndex = items[activeContainer].findIndex((i: any) => i.id === active.id)
      const overIndex = items[activeContainer].findIndex((i: any) => i.id === overId)

      if (activeIndex !== overIndex) {
        setItems((prev: any) => ({
          ...prev,
          [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex)
        }))
      }
    }

    setActiveId(null)
  }

  if (!isMounted) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex w-80 shrink-0 flex-col gap-4 rounded-lg bg-zinc-900/50 p-4 border border-zinc-800 min-h-[500px]">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-50">{col.title}</h3>
              <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">0</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <DndContext
      id="kanban-board"
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
