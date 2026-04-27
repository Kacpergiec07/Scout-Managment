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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { 
  Plus, 
  MoreVertical, 
  MapPin, 
  TrendingUp, 
  UserMinus,
  GripVertical
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { updateWatchlistStatus } from '@/app/actions/watchlist'
import Image from 'next/image'

const COLUMNS = [
  { id: 'potential', title: 'Discovery', color: 'text-blue-400' },
  { id: 'monitoring', title: 'Monitoring', color: 'text-[#00ff88]' },
  { id: 'negotiation', title: 'Negotiation', color: 'text-orange-400' },
  { id: 'closed', title: 'Closed/History', color: 'text-purple-400' },
]

interface KanbanPlayer {
  id: string
  player_id: string
  player_name: string
  club: string
  position: string
  league: string
  player_photo: string
  status: string
  market_value?: string
}

export function KanbanWatchlist({ initialPlayers }: { initialPlayers: KanbanPlayer[] }) {
  const [players, setPlayers] = React.useState(initialPlayers)
  const [activeId, setActiveId] = React.useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activePlayer = players.find(p => p.id === active.id)
    const overId = over.id as string

    // Check if dropping over a column or another player
    let newStatus = activePlayer?.status
    if (COLUMNS.find(c => c.id === overId)) {
      newStatus = overId
    } else {
      const overPlayer = players.find(p => p.id === overId)
      newStatus = overPlayer?.status
    }

    if (activePlayer && newStatus && activePlayer.status !== newStatus) {
      // Update local state
      setPlayers(prev => prev.map(p => 
        p.id === active.id ? { ...p, status: newStatus as string } : p
      ))
      
      // Update DB
      await updateWatchlistStatus(active.id as string, newStatus)
    }

    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full min-h-[600px] p-6">
        {COLUMNS.map((col) => (
          <KanbanColumn 
            key={col.id} 
            column={col} 
            players={players.filter(p => p.status === col.id || (!p.status && col.id === 'potential'))} 
          />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="opacity-80 rotate-3 cursor-grabbing scale-105">
            <PlayerCard player={players.find(p => p.id === activeId)!} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function KanbanColumn({ column, players }: { column: typeof COLUMNS[0], players: KanbanPlayer[] }) {
  return (
    <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/5 rounded-[2rem] p-4 min-h-[500px]">
      <div className="flex items-center justify-between px-4 py-2">
        <h3 className={`text-sm font-black uppercase italic tracking-tighter ${column.color}`}>
          {column.title}
        </h3>
        <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] font-bold">
          {players.length}
        </Badge>
      </div>
      
      <div className="flex-1 space-y-4">
        <SortableContext items={players.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {players.map((player) => (
            <SortablePlayerCard key={player.id} player={player} />
          ))}
        </SortableContext>
        
        {players.length === 0 && (
          <div className="h-24 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Empty Slot</span>
          </div>
        )}
      </div>

      <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 transition-all border border-transparent hover:border-white/10 group">
        <Plus className="w-4 h-4 text-gray-500 group-hover:text-white" />
        <span className="text-[10px] font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">Add Lead</span>
      </button>
    </div>
  )
}

function SortablePlayerCard({ player }: { player: KanbanPlayer }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: player.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <PlayerCard player={player} />
    </div>
  )
}

function PlayerCard({ player, isOverlay }: { player: KanbanPlayer, isOverlay?: boolean }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group relative bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 cursor-grab active:cursor-grabbing hover:border-[#00ff88]/30 transition-all ${isOverlay ? 'shadow-2xl shadow-[#00ff88]/20' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
          <Image 
            src={player.player_photo || ''} 
            alt={player.player_name} 
            fill 
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[9px] font-bold text-[#00ff88] uppercase tracking-widest truncate">{player.position}</span>
            <MoreVertical className="w-3 h-3 text-gray-600" />
          </div>
          <h4 className="text-sm font-black text-white uppercase italic tracking-tighter truncate group-hover:text-[#00ff88] transition-colors">
            {player.player_name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
               {/* Small club logo if available */}
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{player.club}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-1 text-gray-500">
           <MapPin className="w-3 h-3" />
           <span className="text-[8px] font-bold uppercase tracking-widest">{player.league}</span>
        </div>
        <div className="text-[10px] font-mono font-black text-white">
           {player.market_value || '€--M'}
        </div>
      </div>
    </motion.div>
  )
}
