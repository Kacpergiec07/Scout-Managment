'use client'

import * as React from 'react'
import { Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export function NotificationsBell() {
  const [hasUnread, setHasUnread] = React.useState(true)
  
  const notifications = [
    { id: '1', text: '📈 Erling Haaland score increased by 5%', time: '2h ago' },
    { id: '2', text: '⚽ New matching club found: Liverpool F.C.', time: '5h ago' },
    { id: '3', text: '🔄 Transfer alert: Amadou Onana moved to Villa', time: '1d ago' },
  ]

  return (
    <DropdownMenu onOpenChange={() => setHasUnread(false)}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-zinc-50">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 border-2 border-zinc-900" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800 text-zinc-50">
        <DropdownMenuLabel>Scouting Alerts</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        {notifications.map((n) => (
          <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 focus:bg-zinc-800">
            <span className="text-sm">{n.text}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{n.time}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-zinc-800" />
        <DropdownMenuItem className="justify-center text-xs text-emerald-500 font-medium">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
