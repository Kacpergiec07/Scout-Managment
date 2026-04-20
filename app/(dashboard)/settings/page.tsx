'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { User, Bell, Database, Shield, Save, Check, Mail, Moon, Sun, Loader2, Key } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { getProfileData, updateProfile, updateNotificationPreferences } from '@/app/actions/profile'

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: string | null
  region: string | null
  bio: string | null
  notification_preferences: {
    email_alerts: boolean
    push_notifications: boolean
    player_updates: boolean
    transfer_alerts: boolean
    weekly_reports: boolean
  }
}

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Form states
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [region, setRegion] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    async function loadUserData() {
      setLoading(true)
      try {
        const profileData = await getProfileData()
        if (profileData) {
          setUser(profileData as UserProfile)
          setFullName(profileData.full_name || '')
          setRole(profileData.role || 'Scout')
          setRegion(profileData.region || '')
          setBio(profileData.bio || '')
          setAvatarUrl(profileData.avatar_url || '')
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
      setLoading(false)
    }

    loadUserData()
  }, [])

  const handleProfileUpdate = async (formData: FormData) => {
    setSaveStatus('saving')
    const result = await updateProfile(formData)

    if (result.error) {
      setSaveStatus('error')
      return
    }

    if (result.success) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)

      // Refresh user data
      const profileData = await getProfileData()
      if (profileData) {
        setUser(profileData as UserProfile)
      }
    }
  }

  const handleNotificationUpdate = async (formData: FormData) => {
    setSaveStatus('saving')
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

  if (loading || !user) {
    return (
      <div className="relative w-full h-full bg-background text-foreground overflow-hidden flex transition-colors duration-300">
        <div className="flex-1 w-full h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto" />
            <p className="text-muted-foreground text-lg">Loading settings...</p>
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
                  <Button variant="default" size="lg" formAction={handleProfileUpdate}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
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
                  className="px-8 py-3 rounded-lg bg-green-500 text-black text-sm font-black uppercase tracking-widest flex items-center gap-2"
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
              <form className="space-y-6">
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
                  <Label htmlFor="region" className="text-foreground">Assigned Region</Label>
                  <Input
                    id="region"
                    name="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
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
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Control how you receive updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action={handleNotificationUpdate}>
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
                      <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-green-500" />
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
                  <Button variant="outline" size="sm" formAction={handleNotificationUpdate}>
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
                  <Button variant="outline" size="sm" onClick={toggleTheme}>
                    Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode
                  </Button>
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
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <p className="font-semibold text-foreground">Statorium API</p>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Real-time player data and match statistics</p>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <p className="font-semibold text-foreground">Neon Database</p>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">PostgreSQL database for data persistence</p>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <p className="font-semibold text-foreground">OpenAI API</p>
                  </div>
                  <Badge variant="outline" className="text-green-500 border-green-500/30">
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">AI-powered analysis and recommendations</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  )
}