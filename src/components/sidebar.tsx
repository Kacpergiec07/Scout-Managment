'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, List, History, User, LogOut, Settings, LayoutDashboard, ArrowRightLeft, Globe, Briefcase, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { signOut } from '@/app/auth/actions'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './theme-toggle'
import { CustomThemeDialog } from './custom-theme-dialog'

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/scout-jobs', icon: Briefcase, label: 'Scout Jobs' },
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
    <aside className="hidden w-64 flex-col border-r border-border md:flex bg-sidebar transition-colors duration-300">
      {/* Top Header Logo */}
      <div className="flex h-[88px] items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-3 font-black text-foreground text-lg tracking-widest mt-2">
          <div className="h-6 w-1 bg-secondary rounded-sm shadow-[0_0_10px_hsl(var(--secondary)/0.8)]" />
          SCOUT PRO
        </Link>
        <div className="flex items-center gap-1.5">
          <CustomThemeDialog />
          <ThemeToggle />

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
              className={`group flex items-center gap-4 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all duration-300 ${
                isActive 
                 ? 'text-secondary bg-secondary/10 shadow-sm border border-secondary/20' 
                 : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <item.icon className={`h-5 w-5 transition-colors ${isActive ? 'text-secondary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className="tracking-[0.05em]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Navigation */}
      <div className="border-t border-border p-6 space-y-3">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-all duration-300 ${
                isActive 
                 ? 'text-foreground bg-accent border border-border shadow-sm' 
                 : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="tracking-[0.05em]">{item.label}</span>
            </Link>
          )
        })}
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center mr-1">
              <span className="text-foreground text-xs font-black">N</span>
            </div>
            <span className="tracking-[0.05em]">Sign Out</span>
          </button>
        </form>
      </div>
    </aside>
  )
}
