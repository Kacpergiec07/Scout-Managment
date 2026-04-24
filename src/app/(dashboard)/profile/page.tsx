'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, MapPin, Mail, Shield, Trophy, Target, Award, TrendingUp, Edit, Calendar, Loader2, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { getProfileData } from '@/app/actions/profile'
import { fixUserProfile } from '@/app/actions/fix-profile'

interface UserProfile {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  role: string | null
  assigned_region: string | null
  bio: string | null
  join_date: string | null
  // Dynamic statistics from database
  players_watched_count: number
  active_scouting_count: number
  reports_created_count: number
  years_experience: number
}

interface WatchlistStats {
  players_watched_count: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<WatchlistStats>({
    players_watched_count: 0
  })

  const loadProfileData = async (autoFix = true) => {
    setLoading(true)
    try {
      const profileData = await getProfileData()
      if (profileData) {
        setUser(profileData as UserProfile)
        // Set real statistics from database
        setStats({
          players_watched_count: profileData.players_watched_count || 0
        })
      } else if (autoFix) {
        // If profile data is null and auto-fix is enabled, try to fix it
        console.log('Profile data is null, attempting auto-fix...')
        const fixResult = await fixUserProfile()
        if (fixResult.success) {
          console.log('Auto-fix successful, reloading profile data...')
          // Reload profile data after fix
          await loadProfileData(false) // Don't auto-fix again to prevent loops
        } else {
          console.error('Auto-fix failed:', fixResult.error)
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      if (autoFix) {
        console.log('Error loading profile, attempting auto-fix...')
        const fixResult = await fixUserProfile()
        if (fixResult.success) {
          console.log('Auto-fix successful, reloading profile data...')
          await loadProfileData(false)
        }
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProfileData()

    // Add event listener for visibility change to refresh data when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadProfileData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Calculate derived data
  const userName = user?.full_name || user?.email?.split('@')[0] || 'Scout'
  const userRole = user?.role || 'Scout'
  const userRegion = user?.assigned_region || 'Global'
  const userAvatar = user?.avatar_url || `https://ui-avatars.com/api/?name=${userName.replace(/\s+/g, '+')}&background=22c55e&color=fff`
  const joinDate = user?.join_date || new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })

  const dynamicStats = [
    { label: 'Players Watched', value: String(user?.players_watched_count || 0), icon: Target, color: 'text-green-500' },
    { label: 'Years Experience', value: String(user?.years_experience || 0), icon: Award, color: 'text-purple-500' },
    { label: 'Reports Created', value: String(user?.reports_created_count || 0), icon: Trophy, color: 'text-blue-500' },
    { label: 'Active Scouting', value: String(user?.active_scouting_count || 0), icon: TrendingUp, color: 'text-orange-500' },
  ]

  const mockActivity = [
    { id: 1, player: 'Florian Wirtz', action: 'Added to watchlist', date: '2 hours ago' },
    { id: 2, player: 'Jude Bellingham', action: 'Updated scouting notes', date: '1 day ago' },
    { id: 3, player: 'Lamine Yamal', action: 'Analysis completed', date: '3 days ago' },
  ]

  if (loading) {
    return (
      <div className="relative w-full h-full bg-background text-foreground overflow-hidden flex transition-colors duration-300">
        <div className="flex-1 w-full h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto" />
            <p className="text-muted-foreground text-lg">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full bg-background text-foreground overflow-hidden flex transition-colors duration-300">
      {/* Main Content */}
      <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto p-8 lg:p-12 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase text-foreground mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground font-semibold tracking-widest text-sm uppercase">
                Scout Management Dashboard
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => loadProfileData()} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/settings">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </a>
              </Button>
            </div>
          </div>

          {/* Profile Card */}
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-32 h-32 rounded-full bg-gradient-to-tr from-green-500 to-emerald-300 p-1 relative z-10 flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="w-full h-full rounded-full object-cover bg-background"
                    />
                  </motion.div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-foreground mb-1">
                      {userName}
                    </h2>
                    <Badge variant="default" className="mb-3">
                      <Shield className="w-3 h-3 mr-1" />
                      {userRole}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/20 border border-border">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/20 border border-border">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Assigned Region
                        </p>
                        <p className="text-sm font-semibold text-foreground">{userRegion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/20 border border-border">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Member Since
                        </p>
                        <p className="text-sm font-semibold text-foreground">{joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/20 border border-border">
                      <User className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Status
                        </p>
                        <Badge variant="outline" className="text-green-500 border-green-500/30">
                          Active Scout
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {user?.bio && (
                    <div className="mt-4 p-4 rounded-xl bg-accent/10 border-border">
                      <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-green-500 rounded-full" />
              <h3 className="text-lg font-black uppercase tracking-[0.2em] text-foreground">
                Performance Statistics
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dynamicStats.map((stat, index) => (
                <Card key={stat.label}>
                  <CardContent className="p-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-accent/20 flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <p className="text-4xl font-black text-foreground mb-2">{stat.value}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {stat.label}
                      </p>
                    </motion.div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h3 className="text-lg font-black uppercase tracking-[0.2em] text-foreground">
                Recent Activity
              </h3>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {mockActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-border hover:border-green-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Target className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{activity.player}</p>
                          <p className="text-muted-foreground text-xs">{activity.action}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">{activity.date}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

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