'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, MapPin, Mail, Shield, Trophy, Target, Award, TrendingUp, Edit, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  // Mock user data
  const user = {
    name: 'Michał Nowak',
    email: 'michal.nowak@scoutpro.com',
    role: 'Senior Scout',
    region: 'Central Europe',
    avatar: 'https://ui-avatars.com/api/?name=Michał+Nowak&background=22c55e&color=fff',
    joinDate: 'January 2024',
  }

  const stats = [
    { label: 'Reports Created', value: '147', icon: Trophy, color: 'text-green-500' },
    { label: 'Players Watched', value: '89', icon: Target, color: 'text-blue-500' },
    { label: 'Years Experience', value: '12', icon: Award, color: 'text-purple-500' },
    { label: 'Top Scouts', value: '#3', icon: TrendingUp, color: 'text-orange-500' },
  ]

  const recentActivity = [
    { id: 1, player: 'Florian Wirtz', action: 'Added to watchlist', date: '2 hours ago' },
    { id: 2, player: 'Jude Bellingham', action: 'Created scouting report', date: '1 day ago' },
    { id: 3, player: 'Lamine Yamal', action: 'Compared with database', date: '3 days ago' },
  ]

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
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
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
                      src={user.avatar}
                      alt={user.name}
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
                      {user.name}
                    </h2>
                    <Badge variant="default" className="mb-3">
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/20 border border-border">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Email
                        </p>
                        <p className="text-sm font-semibold text-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/20 border border-border">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Assigned Region
                        </p>
                        <p className="text-sm font-semibold text-foreground">{user.region}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/20 border border-border">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                          Member Since
                        </p>
                        <p className="text-sm font-semibold text-foreground">{user.joinDate}</p>
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
              {stats.map((stat, index) => (
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
                  {recentActivity.map((activity, index) => (
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