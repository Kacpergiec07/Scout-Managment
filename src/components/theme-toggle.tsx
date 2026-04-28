'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl opacity-0">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-10 h-10 rounded-xl hover:bg-muted transition-all duration-300 group relative"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5">
        <Sun className={`h-5 w-5 absolute transition-all duration-500 rotate-0 scale-100 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'} text-orange-500`} />
        <Moon className={`h-5 w-5 absolute transition-all duration-500 ${isDark ? '-rotate-12 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'} text-purple-500`} />
      </div>
      
      {/* Subtle glow effect */}
      <div className={`absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${isDark ? 'bg-purple-500' : 'bg-orange-500'}`} />
    </Button>
  )
}
