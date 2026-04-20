'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { User, Bell, Database, Shield, Save, Check, Mail, Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [darkMode, setDarkMode] = useState(resolvedTheme === 'dark')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const [apiStatus, setApiStatus] = useState({
    statorium: true,
    neon: true,
  })

  const handleSave = async () => {
    setSaveStatus('saving')
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    setDarkMode(newTheme === 'dark')
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
                  <Button onClick={handleSave} size="lg">
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
            </AnimatePresence>
          </div>

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your profile and personal information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Email Alerts</p>
                    <p className="text-sm text-muted-foreground">Receive email notifications</p>
                  </div>
                </div>
                <Switch
                  checked={emailAlerts}
                  onCheckedChange={setEmailAlerts}
                  size="default"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-border">
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
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                  size="default"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    {darkMode ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-purple-500" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle application theme</p>
                  </div>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={toggleTheme}
                  size="default"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Customize how you receive updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-accent/10 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Player Updates</p>
                  <Switch checked={true} onCheckedChange={() => {}} size="default" />
                </div>
                <p className="text-sm text-muted-foreground">Get notified when players on your watchlist have updates</p>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Transfer Alerts</p>
                  <Switch checked={true} onCheckedChange={() => {}} size="default" />
                </div>
                <p className="text-sm text-muted-foreground">Receive alerts for major transfer activities</p>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Weekly Reports</p>
                  <Switch checked={false} onCheckedChange={() => {}} size="default" />
                </div>
                <p className="text-sm text-muted-foreground">Get weekly summary of your scouting activities</p>
              </div>
            </CardContent>
          </Card>

          {/* API Integrations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <CardTitle>API Integrations</CardTitle>
                  <CardDescription>Manage third-party service connections</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-accent/10 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${apiStatus.statorium ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="font-semibold text-foreground">Statorium API</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {apiStatus.statorium ? 'Connected' : 'Connect'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Real-time player data and match statistics</p>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${apiStatus.neon ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="font-semibold text-foreground">Neon Database</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {apiStatus.neon ? 'Connected' : 'Connect'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">PostgreSQL database for data persistence</p>
              </div>

              <div className="p-4 rounded-xl bg-accent/10 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <p className="font-semibold text-foreground">OpenAI API</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
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