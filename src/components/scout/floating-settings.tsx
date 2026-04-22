'use client'

import React from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { motion } from 'framer-motion'

export function FloatingSettings() {
  return (
    <div className="relative group">
      <Link href="/settings">
        <motion.div
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-background border border-border shadow-xl hover:bg-accent text-foreground glass-panel group-hover:shadow-emerald-500/10 transition-all duration-500"
          >
            <Settings className="h-6 w-6" />
          </Button>
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-foreground text-background text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl">
            Account Settings
          </span>
        </motion.div>
      </Link>
    </div>
  )
}
