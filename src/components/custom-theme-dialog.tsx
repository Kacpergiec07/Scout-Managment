'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Palette, RotateCcw } from 'lucide-react'
import { getCustomColors, applyCustomColors, CustomColors } from '@/lib/custom-theme'

export function CustomThemeDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [customColors, setCustomColors] = useState<CustomColors>({
    primary: '#18181b',
    secondary: '#00ff88',
    foreground: '#ffffff',
    background: '#09090b'
  })

  useEffect(() => {
    const savedColors = getCustomColors()
    if (savedColors) {
      setCustomColors(savedColors)
    }
  }, [])

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    const newColors = { ...customColors, [key]: value }
    setCustomColors(newColors)
    applyCustomColors(newColors)
  }

  const resetTheme = () => {
    const defaultColors = {
      primary: '#18181b',
      secondary: '#00ff88',
      foreground: '#ffffff',
      background: '#09090b'
    }
    setCustomColors(defaultColors)
    applyCustomColors(null)
    window.location.reload()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-muted transition-all duration-300 group relative" title="Custom Theme">
            <Palette className="h-5 w-5 text-zinc-400 group-hover:text-purple-500 transition-colors" />
            <div className="absolute inset-0 rounded-xl blur-md opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-purple-500" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-950/90 backdrop-blur-xl border-white/10 text-white sm:max-w-[425px] rounded-3xl z-[101]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">Personalize Interface</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Adjust the core colors of the platform. Changes apply instantly.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
          {/* Primary Color */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Primary Color</Label>
              <span className="text-[10px] font-mono text-zinc-400">{customColors.primary}</span>
            </div>
            <div className="flex gap-3 items-center">
              <input 
                type="color" 
                value={customColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
              />
              <Input 
                value={customColors.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1 bg-white/5 border-white/10 h-12 rounded-xl font-mono text-sm uppercase"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Secondary Color</Label>
              <span className="text-[10px] font-mono text-zinc-400">{customColors.secondary}</span>
            </div>
            <div className="flex gap-3 items-center">
              <input 
                type="color" 
                value={customColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
              />
              <Input 
                value={customColors.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="flex-1 bg-white/5 border-white/10 h-12 rounded-xl font-mono text-sm uppercase"
              />
            </div>
          </div>

          {/* Foreground (Text) Color */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Text & Content Color</Label>
              <span className="text-[10px] font-mono text-zinc-400">{customColors.foreground}</span>
            </div>
            <div className="flex gap-3 items-center">
              <input 
                type="color" 
                value={customColors.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
                className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
              />
              <Input 
                value={customColors.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
                className="flex-1 bg-white/5 border-white/10 h-12 rounded-xl font-mono text-sm uppercase"
              />
            </div>
          </div>

          {/* Background Color */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-black uppercase tracking-widest text-zinc-500">Background Color</Label>
              <span className="text-[10px] font-mono text-zinc-400">{customColors.background}</span>
            </div>
            <div className="flex gap-3 items-center">
              <input 
                type="color" 
                value={customColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-12 h-12 rounded-xl bg-transparent border-none cursor-pointer"
              />
              <Input 
                value={customColors.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="flex-1 bg-white/5 border-white/10 h-12 rounded-xl font-mono text-sm uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-2xl hover:bg-white/5 text-zinc-400 hover:text-white transition-all h-12 text-xs font-black uppercase tracking-widest"
            onClick={resetTheme}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button 
            className="flex-1 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-xs h-12 hover:opacity-90"
            onClick={() => setIsOpen(false)}
          >
            Save Theme
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
