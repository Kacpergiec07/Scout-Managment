'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { User, Bell, Database, Shield, Save, Check, Mail, Moon, Sun, Loader2, Key, TrendingUp, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { getProfileData, updateProfile, updateNotificationPreferences } from '@/app/actions/profile'
import { fixUserProfile } from '@/app/actions/fix-profile'
import { getCustomColors, applyCustomColors, CustomColors } from '@/lib/custom-theme'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Palette, RotateCcw } from 'lucide-react'
import { CustomThemeDialog } from '@/components/custom-theme-dialog'

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: string | null
  assigned_region: string | null
  bio: string | null
  notification_preferences: {
    email_alerts: boolean
    push_notifications: boolean
    player_updates: boolean
    transfer_alerts: boolean
    weekly_reports: boolean
  }
  // Statistics fields
  years_experience: number
  players_watched_count: number
  active_scouting_count: number
  reports_created_count: number
}

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Form states
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [assignedRegion, setAssignedRegion] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  // Statistics states
  const [yearsExperience, setYearsExperience] = useState(0)
  const [playersWatchedCount, setPlayersWatchedCount] = useState(0)
  const [activeScoutingCount, setActiveScoutingCount] = useState(0)
  const [reportsCreatedCount, setReportsCreatedCount] = useState(0)

  // Custom theme state
  const [isCustomThemeOpen, setIsCustomThemeOpen] = useState(false)
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
    applyCustomColors(null) // This will remove properties and localStorage
    window.location.reload() // Reload to get back to CSS defaults properly
  }

  useEffect(() => {
    async function loadUserData(autoFix = true) {
      setLoading(true)
      console.log('Settings: Starting to load user data...')

      try {
        const profileData = await getProfileData()
        console.log('Settings: Profile data received:', profileData)

        if (profileData) {
          setUser(profileData as UserProfile)
          setFullName(profileData.full_name || '')
          setRole(profileData.role || 'Scout')
          setAssignedRegion(profileData.assigned_region || '')
          setBio(profileData.bio || '')
          setAvatarUrl(profileData.avatar_url || '')
          // Set statistics
          setYearsExperience(profileData.years_experience || 0)
          setPlayersWatchedCount(profileData.players_watched_count || 0)
          setActiveScoutingCount(profileData.active_scouting_count || 0)
          setReportsCreatedCount(profileData.reports_created_count || 0)
        } else if (autoFix) {
          // Auto-fix profile if data is missing
          console.log('Settings: No profile data, attempting auto-fix...')
          const fixResult = await fixUserProfile()
          if (fixResult.success) {
            console.log('Settings: Auto-fix successful, reloading data...')
            await loadUserData(false) // Don't auto-fix again
          } else {
            console.error('Settings: Auto-fix failed:', fixResult.error)
            setUser(null)
          }
        } else {
          console.warn('Settings: No profile data returned, using empty state')
          setUser(null)
        }
      } catch (error) {
        console.error('Settings: Failed to load user data:', error)
        if (autoFix) {
          console.log('Settings: Error loading data, attempting auto-fix...')
          const fixResult = await fixUserProfile()
          if (fixResult.success) {
            console.log('Settings: Auto-fix successful, reloading data...')
            await loadUserData(false)
          } else {
            console.error('Settings: Auto-fix failed:', fixResult.error)
          }
        }
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveStatus('saving')

    const formData = new FormData(event.currentTarget)
    console.log('Settings: Form submitted with data:', Object.fromEntries(formData.entries()))

    const result = await updateProfile(formData)

    if (result.error) {
      console.error('Settings: Profile update failed:', result.error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
      return
    }

    if (result.success) {
      console.log('Settings: Profile update successful:', result.data)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)

      // Refresh user data
      const profileData = await getProfileData()
      if (profileData) {
        setUser(profileData as UserProfile)
        // Update local state with new values
        setYearsExperience(profileData.years_experience || 0)
        setPlayersWatchedCount(profileData.players_watched_count || 0)
        setActiveScoutingCount(profileData.active_scouting_count || 0)
        setReportsCreatedCount(profileData.reports_created_count || 0)
      }
    }
  }

  const handleNotificationUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaveStatus('saving')

    const formData = new FormData(event.currentTarget)
    console.log('Settings: Notification form submitted with data:', Object.fromEntries(formData.entries()))

    const result = await updateNotificationPreferences(formData)

    if (result.error) {
      setSaveStatus('error')
      return
    }

    if (result.success) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)

      // Update local state
      if (user) {
        setUser({
          ...user,
          notification_preferences: result.preferences as any
        })
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  if (loading) {
    return (
      <div className="relative w-full h-full bg-background text-foreground overflow-hidden flex transition-colors duration-300">
        <div className="flex-1 w-full h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-secondary mx-auto" />
            <p className="text-muted-foreground text-lg font-medium tracking-wide">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="relative w-full h-full bg-background text-foreground overflow-hidden flex transition-colors duration-300">
        <div className="flex-1 w-full h-full flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md px-6">
            <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Access Interrupted</h2>
              <p className="text-muted-foreground">We couldn't retrieve your profile intelligence. This might be a temporary synchronization issue.</p>
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="border-secondary/50 text-secondary dark:text-secondary hover:bg-secondary/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-background text-foreground overflow-hidden flex transition-colors duration-300">
      {/* Main Content */}
      <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-8 lg:p-12 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground mb-2">
                Settings
              </h1>
              <p className="text-muted-foreground font-semibold tracking-widest text-sm uppercase">
                Account & Application Configuration
              </p>
            </div>
            <AnimatePresence mode="wait">
              {saveStatus === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <div className="px-8 py-3 rounded-lg bg-accent border-border text-sm font-black uppercase tracking-widest">
                    Ready to save
                  </div>
                </motion.div>
              )}
              {saveStatus === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-8 py-3 rounded-lg bg-accent border-border text-sm font-black uppercase tracking-widest"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-t-foreground border-r-transparent border-b-transparent border-l-transparent rounded-full mx-auto"
                  />
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-8 py-3 rounded-lg bg-secondary text-black text-sm font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Saved Successfully
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-8 py-3 rounded-lg bg-red-500/10 border-red-500/30 text-red-500 text-sm font-black uppercase tracking-widest"
                >
                  <span className="text-lg mr-2">⚠️</span>
                  Save Failed
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and role</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground">Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Scout, Senior Scout, etc."
                    className="bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedRegion" className="text-foreground">Assigned Region</Label>
                  <Input
                    id="assignedRegion"
                    name="assigned_region"
                    value={assignedRegion}
                    onChange={(e) => setAssignedRegion(e.target.value)}
                    placeholder="Europe, Asia, etc."
                    className="bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl" className="text-foreground">Avatar URL</Label>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-foreground">Bio</Label>
                  <Input
                    id="bio"
                    name="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="p-4 rounded-xl bg-accent/10 border-border">
                  <p className="text-sm font-semibold text-foreground mb-2">Current Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    To change email, use the account management in Supabase
                  </p>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Statistics Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle>Performance Statistics</CardTitle>
                  <CardDescription>Manually set or override statistics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience" className="text-foreground">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    name="yearsExperience"
                    type="number"
                    value={yearsExperience}
                    onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                    placeholder="Enter your years of experience"
                    className="bg-accent/20 border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground italic">
                    Manual field - cannot be calculated automatically
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="playersWatched" className="text-foreground">Players Watched</Label>
                    <Input
                      id="playersWatched"
                      name="playersWatched"
                      type="number"
                      value={playersWatchedCount}
                      disabled
                      placeholder="Auto-calculated"
                      className="bg-muted/30 border-border text-muted-foreground placeholder:text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground italic">
                      Auto-calculated from watchlist
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activeScouting" className="text-foreground">Active Scouting</Label>
                    <Input
                      id="activeScouting"
                      name="activeScouting"
                      type="number"
                      value={activeScoutingCount}
                      disabled
                      placeholder="Auto-calculated"
                      className="bg-muted/30 border-border text-muted-foreground placeholder:text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground italic">
                      Auto-calculated from watchlist
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reportsCreated" className="text-foreground">Reports Created</Label>
                    <Input
                      id="reportsCreated"
                      name="reportsCreated"
                      type="number"
                      value={reportsCreatedCount}
                      disabled
                      placeholder="Auto-calculated"
                      className="bg-muted/30 border-border text-muted-foreground placeholder:text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground italic">
                      Auto-calculated from analysis history
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border-blue-500/30">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    ℹ️ Statistics Information
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Statistics are automatically calculated from your database activity. "Players Watched" and "Active Scouting" reflect real counts from your watchlist. "Reports Created" shows your analysis history. "Years of Experience" is the only manual field that must be set by you.
                  </p>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Statistics
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control how you receive updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationUpdate} className="space-y-4">
                <div className="p-4 rounded-xl bg-accent/10 border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Email Alerts</p>
                        <p className="text-sm text-muted-foreground">Receive email notifications</p>
                      </div>
                    </div>
                    <Switch
                      name="emailAlerts"
                      checked={user.notification_preferences?.email_alerts || false}
                      onCheckedChange={(checked) =>
                        setUser(prev => prev ? { ...prev, notification_preferences: { ...prev.notification_preferences!, email_alerts: checked } } : null)
                      }
                      size="default"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent/10 border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Browser push notifications</p>
                      </div>
                    </div>
                    <Switch
                      name="pushNotifications"
                      checked={user.notification_preferences?.push_notifications || false}
                      onCheckedChange={(checked) =>
                        setUser(prev => prev ? { ...prev, notification_preferences: { ...prev.notification_preferences!, push_notifications: checked } } : null)
                      }
                      size="default"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent/10 border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Player Updates</p>
                        <p className="text-sm text-muted-foreground">Get notified when players on your watchlist have updates</p>
                      </div>
                    </div>
                    <Switch
                      name="playerUpdates"
                      checked={user.notification_preferences?.player_updates || false}
                      onCheckedChange={(checked) =>
                        setUser(prev => prev ? { ...prev, notification_preferences: { ...prev.notification_preferences!, player_updates: checked } } : null)
                      }
                      size="default"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent/10 border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Transfer Alerts</p>
                        <p className="text-sm text-muted-foreground">Receive alerts for major transfer activities</p>
                      </div>
                    </div>
                    <Switch
                      name="transferAlerts"
                      checked={user.notification_preferences?.transfer_alerts || false}
                      onCheckedChange={(checked) =>
                        setUser(prev => prev ? { ...prev, notification_preferences: { ...prev.notification_preferences!, transfer_alerts: checked } } : null)
                      }
                      size="default"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-accent/10 border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">Get weekly summary of your scouting activities</p>
                      </div>
                    </div>
                    <Switch
                      name="weeklyReports"
                      checked={user.notification_preferences?.weekly_reports || false}
                      onCheckedChange={(checked) =>
                        setUser(prev => prev ? { ...prev, notification_preferences: { ...prev.notification_preferences!, weekly_reports: checked } } : null)
                      }
                      size="default"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Notification Preferences
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  {resolvedTheme === 'dark' ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-purple-500" />}
                </div>
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the application theme</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-accent/10 border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${resolvedTheme === 'dark' ? 'bg-purple-500/10' : 'bg-orange-500/10'} flex items-center justify-center`}>
                      {resolvedTheme === 'dark' ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Dark Mode</p>
                      <p className="text-sm text-muted-foreground">Toggle application theme</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={toggleTheme} className="w-full">
                      Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
                    </Button>
                    <Dialog open={isCustomThemeOpen} onOpenChange={setIsCustomThemeOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full border-dashed">
                          <Palette className="w-4 h-4 mr-2 text-purple-500" />
                          Custom Theme
                        </Button>
                      </DialogTrigger>
                      <CustomThemeDialog />
                    </Dialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Integration Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle>API Integrations</CardTitle>
                  <CardDescription>Current service connections</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-accent/10 border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <p className="font-semibold text-foreground">Statorium API</p>
                  </div>
                  <Badge variant="outline" className="text-secondary border-secondary/30">
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Real-time player data and match statistics</p>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <p className="font-semibold text-foreground">Neon Database</p>
                  </div>
                  <Badge variant="outline" className="text-secondary border-secondary/30">
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">PostgreSQL database for data persistence</p>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <p className="font-semibold text-foreground">OpenAI API</p>
                  </div>
                  <Badge variant="outline" className="text-secondary border-secondary/30">
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">AI-powered analysis and recommendations</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  )
}
