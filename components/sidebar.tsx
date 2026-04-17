'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, List, History, User, LogOut, Settings, LayoutDashboard, ArrowRightLeft, Globe, Bell, Moon } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

export function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/watchlist', icon: List, label: 'Watchlist' },
    { href: '/history', icon: History, label: 'History' },
    { href: '/compare', icon: Search, label: 'Compare Players' },
    { href: '/transfers', icon: ArrowRightLeft, label: 'Transfers' },
    { href: '/leagues', icon: Globe, label: 'Leagues' },
  ]

  const bottomItems = [
    { href: '/profile', icon: User, label: 'My Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="hidden w-64 flex-col border-r border-white/5 md:flex bg-[#050505]">
      {/* Top Header Logo */}
      <div className="flex h-[88px] items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-3 font-black text-white text-lg tracking-widest mt-2">
          <div className="h-6 w-1 bg-green-500 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
          SCOUT PRO
        </Link>
        <div className="flex items-center gap-4 text-zinc-500 mt-2">
          <Moon className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
          <div className="relative cursor-pointer group">
            <Bell className="w-4 h-4 hover:text-white transition-colors" />
            {/* Fake little dot representing unread notifications */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-[#050505]"></div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-3 px-6 py-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 rounded-md px-3 py-2.5 text-[15px] font-semibold transition-all duration-300 ${
                isActive 
                 ? 'text-green-400 bg-white/5 shadow-inner' 
                 : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
              <span className="tracking-[0.05em]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="border-t border-white/5 p-6 space-y-3">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 rounded-md px-3 py-2.5 text-[15px] font-semibold transition-all duration-300 ${
                isActive 
                 ? 'text-white bg-white/5' 
                 : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="tracking-[0.05em]">{item.label}</span>
            </Link>
          )
        })}
        <form>
          <button
            formAction={signOut}
            className="flex w-full items-center gap-4 rounded-md px-3 py-2.5 text-[15px] font-semibold text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mr-1">
              <span className="text-white text-xs font-black">N</span>
            </div>
            <span className="tracking-[0.05em]">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
