import Link from 'next/link'
import { Search, List, History, User, LogOut, Settings, LayoutDashboard, ArrowRightLeft, Globe, Trophy } from 'lucide-react'
import { signOut } from '@/app/auth/actions'
import { NotificationsBell } from './notifications-bell'
import { ThemeToggle } from './theme-toggle'

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r border-zinc-200 dark:border-zinc-800/50 glass-panel md:flex bg-white dark:bg-zinc-950">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
          <div className="h-6 w-1 bg-emerald-500 rounded-full" />
          SCOUT PRO
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationsBell />
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        <SidebarItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <SidebarItem href="/watchlist" icon={List} label="Watchlist" />
        <SidebarItem href="/history" icon={History} label="History" />
        <SidebarItem href="/compare" icon={Search} label="Compare Players" />
        <SidebarItem href="/transfers" icon={ArrowRightLeft} label="Transfers" />
        <SidebarItem href="/leagues" icon={Globe} label="Leagues" />
      </nav>
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
        <SidebarItem href="/profile" icon={User} label="My Profile" />
        <SidebarItem href="/settings" icon={Settings} label="Settings" />
        <form>
          <button
            formAction={signOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}

function SidebarItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  )
}
