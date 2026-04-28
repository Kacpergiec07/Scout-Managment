'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Briefcase, Target, Clock, ArrowRight, CheckCircle, Trash2, User, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CardStack, CardStackItem } from '@/components/ui/card-stack'
import { NotificationsBell } from '@/components/notifications-bell-new'
import { generateJobOffer, getLatestJob, deleteJob, getRecentJobs } from '@/app/actions/job-generation'
import { ThemeToggle } from '@/components/theme-toggle'
import { CustomThemeDialog } from '@/components/custom-theme-dialog'
import { Palette } from 'lucide-react'

interface JobOffer {
  id: string
  club: {
    id: string
    name: string
    logo: string
    league: string
    leagueId: string
  }
  position: string
  requirements: string[]
  priority: 'high' | 'medium' | 'low'
  deadline: string
  description: string
}

interface Club {
  teamID: string;
  teamName: string;
  teamLogo: string;
}

interface LeagueConfig {
  id: string;
  name: string;
  logo: string;
  color: string;
  barColor: string;
  stormTint: string;
  clubs: Club[];
}

const DynamicLeagueCard = React.memo(function DynamicLeagueCard({ league, isActive }: { league: LeagueConfig, isActive: boolean }) {
  const [clubIndex, setClubIndex] = React.useState(0)

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && league.clubs && league.clubs.length > 0) {
      interval = setInterval(() => {
        setClubIndex((prev) => (prev + 1) % league.clubs.length)
      }, 5000) // Even slower for better performance
    }
    return () => clearInterval(interval)
  }, [isActive, league.id, league.clubs?.length])

  if (!league.clubs || league.clubs.length === 0) return null;

  const activeClub = league.clubs[clubIndex]

  return (
    <div className={`relative w-full h-full flex flex-col justify-end overflow-hidden bg-background border border-border rounded-2xl ${isActive ? 'filter-none' : 'brightness-75'}`}>
      
      <div 
        className="absolute inset-0 opacity-40 mix-blend-color-dodge transition-opacity duration-500 z-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at center, ${league.stormTint} 0%, transparent 80%)` }}
      />
      
      {/* Huge Dynamic Club Logo Background */}
      <div className="absolute inset-x-0 top-0 w-full h-[60%] z-10 pointer-events-none flex justify-center items-center overflow-visible p-6 sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeClub.teamName + "_" + league.id}
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ 
              opacity: isActive ? 0.45 : 0.15, 
              x: 0, 
              scale: isActive ? 0.7 : 0.5, 
            }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            transition={{ duration: 0.8 }}
            className="absolute w-full h-full object-contain filter drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] origin-center flex items-center justify-center"
          >
             <Image
              src={activeClub.teamLogo}
              alt={activeClub.teamName}
              fill
              sizes="(max-width: 768px) 100vw, 500px"
              className="object-contain"
              priority={isActive}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={`absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t ${league.color} to-transparent mix-blend-multiply z-10 opacity-90 pointer-events-none`} />
      <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none" />

      <div className="absolute inset-0 w-full mb-16 flex flex-col items-center justify-center gap-1 z-20 transition-all duration-300 pointer-events-none">
         <motion.div 
           animate={{ scale: isActive ? 1.2 : 1.0, y: isActive ? -10 : 0 }}
           transition={{ duration: 0.4 }}
           className="w-16 h-16 md:w-22 md:h-22 bg-background/5 backdrop-blur-md rounded-full shadow-[0_0_30px_rgba(0,0,0,0.2)] flex items-center justify-center p-3.5 mt-[35%]"
         >
            <Image 
              src={league.logo} 
              alt="League Logo" 
              fill
              className="object-contain filter drop-shadow-xl opacity-90 relative z-30" 
            />
         </motion.div>
      </div>

      <div className="flex-1" />
      <div className="relative z-30 w-full py-8 text-center flex items-center justify-center">
          <h2 className="text-sm md:text-base lg:text-lg font-bold tracking-[0.3em] uppercase text-foreground/70 whitespace-nowrap px-4 drop-shadow-lg">
            {league.name}
          </h2>
      </div>
    </div>
  )
})

function DynamicLeagueTable({ leagues, activeIndex, onSelect }: { leagues: LeagueConfig[], activeIndex: number, onSelect: (idx: number) => void }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-card/30 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">League</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Identifier</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Elite Clubs</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Intelligence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {leagues.map((league, idx) => (
              <tr 
                key={league.id} 
                className={`group cursor-pointer hover:bg-primary/5 transition-all ${activeIndex === idx ? 'bg-primary/5' : ''}`}
                onClick={() => onSelect(idx)}
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 relative bg-background rounded-xl p-1.5 shadow-sm border border-border group-hover:scale-110 transition-transform">
                      <Image src={league.logo} alt={league.name} fill className="object-contain" />
                    </div>
                    <span className="font-bold text-sm text-foreground">{league.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <code className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">{league.id}</code>
                </td>
                <td className="px-6 py-5">
                  <div className="flex -space-x-2">
                    {league.clubs.slice(0, 3).map((club) => (
                      <div key={club.teamID} className="w-8 h-8 rounded-full border-2 border-background bg-background p-1 relative overflow-hidden shadow-sm" title={club.teamName}>
                        <Image src={club.teamLogo} alt={club.teamName} fill className="object-contain p-0.5" />
                      </div>
                    ))}
                    {league.clubs.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-muted text-foreground flex items-center justify-center text-[8px] font-bold">
                        +{league.clubs.length - 3}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <Link href={`/leagues?sId=${league.id}`}>
                    <Button variant="ghost" size="sm" className="h-8 px-4 text-[10px] font-bold hover:bg-primary hover:text-black transition-all rounded-xl">
                      ANALYZE
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function JobOfferPanel({ job, onClose, onDelete, onCycleJob, currentIndex, totalJobs }: {
  job: JobOffer,
  onClose: () => void,
  onDelete: () => void,
  onCycleJob: () => void,
  currentIndex: number,
  totalJobs: number
}) {
  const priorityColors = {
    high: 'bg-red-500/20 border-red-500/30 text-red-400',
    medium: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    low: 'bg-secondary/20 border-secondary/30 text-secondary'
  }

  return (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="premium-card bg-gradient-to-br from-card to-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30">
              <Briefcase className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black uppercase tracking-tight">Scouting Mission</h3>
                <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground">
                  {currentIndex + 1}/{totalJobs}
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium tracking-wide">
                AI-Generated Assignment
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="p-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
              title="Delete Assignment"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            {totalJobs > 1 && (
              <button
                onClick={onCycleJob}
                className="p-2 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                title="Next Assignment"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
              title="Close"
            >
              <ArrowRight className="w-5 h-5 rotate-45" />
            </button>
          </div>
        </div>

        {/* Club Information */}
        <div className="bg-muted/50 rounded-2xl p-6 mb-6 border border-border">
          <div className="flex items-center gap-6">
            {job.club.logo && (
              <div className="w-20 h-20 relative bg-background rounded-2xl p-2 shadow-lg border border-border">
                <Image src={job.club.logo} alt={job.club.name} fill className="object-contain" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-3xl font-black uppercase tracking-tight">{job.club.name}</h4>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityColors[job.priority]}`}>
                  {job.priority} Priority
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-medium">{job.club.league}</p>
            </div>
          </div>
        </div>

        {/* Position and Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-primary" />
              <h5 className="font-bold uppercase tracking-wider text-sm">Target Position</h5>
            </div>
            <p className="text-2xl font-black uppercase tracking-tight text-primary">{job.position}</p>
          </div>

          <div className="bg-muted/30 rounded-2xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <h5 className="font-bold uppercase tracking-wider text-sm">Deadline</h5>
            </div>
            <p className="text-2xl font-black uppercase tracking-tight">{job.deadline}</p>
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-8">
          <h5 className="font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary" />
            Requirements
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {job.requirements.map((req, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 bg-muted/30 rounded-xl p-4 border border-border"
              >
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-sm font-medium">{req}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-2xl p-6 mb-8 border-l-4 border-primary">
          <p className="text-sm font-medium leading-relaxed text-foreground/90">
            {job.description}
          </p>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/watchlist">
            <button className="w-full h-14 bg-muted/50 hover:bg-muted border border-border rounded-2xl flex items-center justify-center gap-3 transition-all group">
              <span className="text-sm font-bold uppercase tracking-wider">Watchlist</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <Link href="/leagues">
            <button className="w-full h-14 bg-muted/50 hover:bg-muted border border-border rounded-2xl flex items-center justify-center gap-3 transition-all group">
              <span className="text-sm font-bold uppercase tracking-wider">Leagues</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <Link href={`/teams/${job.club.id}`}>
            <button className="w-full h-14 premium-btn flex items-center justify-center gap-3 transition-all group">
              <span className="text-sm font-bold uppercase tracking-wider">Team Details</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export function DashboardClient({ initialLeagues }: { initialLeagues: LeagueConfig[] }) {
  const [currentJob, setCurrentJob] = useState<JobOffer | null>(null)
  const [allJobs, setAllJobs] = useState<JobOffer[]>([])
  const [currentJobIndex, setCurrentJobIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [showJob, setShowJob] = useState(false)

  // Load all jobs from database on component mount
  useEffect(() => {
    const loadAllJobs = async () => {
      try {
        const jobs = await getRecentJobs(10) // Load up to 10 recent jobs
        if (jobs.length > 0) {
          setAllJobs(jobs)
          setCurrentJob(jobs[0]) // Start with the most recent job
          setCurrentJobIndex(0)
          setShowJob(true) // Show the job panel when loading from database
        }
      } catch (error) {
        console.error('Failed to load jobs:', error)
      }
    }

    loadAllJobs()
  }, [])

  const handleGenerateJob = async () => {
    setIsLoading(true)
    try {
      const job = await generateJobOffer()
      // Add new job to beginning of the list
      setAllJobs([job, ...allJobs])
      setCurrentJob(job)
      setCurrentJobIndex(0)
      setShowJob(true)
    } catch (error) {
      console.error('Failed to generate job:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseJob = () => {
    setShowJob(false)
    setCurrentJob(null)
  }

  const handleCycleJob = () => {
    if (allJobs.length <= 1) return

    const nextIndex = (currentJobIndex + 1) % allJobs.length
    setCurrentJobIndex(nextIndex)
    setCurrentJob(allJobs[nextIndex])
  }

  const handleDeleteJob = async () => {
    if (!currentJob) return

    try {
      const result = await deleteJob(currentJob.id)
      if (result.success) {
        // Remove deleted job from the list
        const updatedJobs = allJobs.filter(job => job.id !== currentJob.id)
        setAllJobs(updatedJobs)

        if (updatedJobs.length > 0) {
          // Move to the next available job
          const nextIndex = Math.min(currentJobIndex, updatedJobs.length - 1)
          setCurrentJobIndex(nextIndex)
          setCurrentJob(updatedJobs[nextIndex])
        } else {
          // No more jobs, close the panel
          setShowJob(false)
          setCurrentJob(null)
        }
      } else {
        console.error('Failed to delete job:', result.error)
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
    }
  }

  return (
    <div className="relative w-full h-full bg-background font-sans flex flex-col items-center select-none overflow-y-auto overflow-x-hidden min-h-screen pb-20">
      {/* Refined Background Effect */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <nav className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-xl border border-primary/30 group-hover:scale-110 transition-transform">
            <span className="filter drop-shadow-[0_0_8px_hsl(var(--secondary)/0.5)]">⚽</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic">SCOUT <span className="text-primary font-light">PRO</span></span>
        </div>

        <div className="hidden lg:flex gap-10 items-center justify-center absolute left-1/2 -translate-x-1/2">
          {[
            { name: 'Watchlist', href: '/watchlist' },
            { name: 'Compare', href: '/compare' },
            { name: 'Transfers', href: '/transfers' },
            { name: 'Leagues', href: '/leagues' }
          ].map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground hover:text-primary transition-all uppercase relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/profile">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors" title="Profile">
              <User className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/settings">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </Link>
          <div className="h-4 w-px bg-border mx-1" />
          <CustomThemeDialog />
          <ThemeToggle />
          <div className="h-4 w-px bg-border mx-1" />
          <NotificationsBell />
        </div>
      </nav>

      <main className="w-full max-w-[1400px] mt-32 px-6 space-y-16 relative z-10">
        {/* Application Description */}
        <div className="text-center space-y-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-foreground leading-[0.9] mb-6">
              PROFESSIONAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">SCOUTING</span>
            </h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                Scout Pro is an advanced platform designed for professional football scouts.
                Search and analyze players from top European leagues, compare performances,
                track transfers, and receive AI-generated scouting assignments tailored to club needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                <span className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary">
                  Player Search & Analysis
                </span>
                <span className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary">
                  Performance Comparison
                </span>
                <span className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary">
                  Transfer Intelligence
                </span>
                <span className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary">
                  AI-Powered Insights
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Job Generation Section */}
        <div className="w-full space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground uppercase italic">
              Receive New Assignment
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Click below to generate a new scouting mission. Our AI will analyze club needs from top 5 European leagues and create a tailored assignment for you.
            </p>
          </div>

          <div className="flex justify-center">
            <motion.button
              onClick={handleGenerateJob}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="premium-btn h-16 px-12 text-base font-bold tracking-wider rounded-2xl flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Generating Mission...</span>
                </>
              ) : (
                <>
                  <Briefcase className="w-6 h-6" />
                  <span>Receive New Job</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Job Offer Panel */}
          <AnimatePresence>
            {showJob && currentJob && (
              <div className="w-full">
                <JobOfferPanel
                  job={currentJob}
                  onClose={handleCloseJob}
                  onDelete={handleDeleteJob}
                  onCycleJob={handleCycleJob}
                  currentIndex={currentJobIndex}
                  totalJobs={allJobs.length}
                />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Available Leagues Quick Access */}
        <div className="w-full space-y-6 pt-8 border-t border-border">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase">
              Available Leagues
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Top 5 European Football Leagues
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {initialLeagues.map((league) => (
              <Link
                key={league.id}
                href={`/leagues?sId=${league.id}`}
                className="group"
              >
                <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/50 transition-all hover:scale-105">
                  <div className="w-16 h-16 relative bg-background rounded-xl p-2 mx-auto mb-4 shadow-sm border border-border group-hover:shadow-lg transition-shadow">
                    <Image src={league.logo} alt={league.name} fill className="object-contain" />
                  </div>
                  <p className="text-xs font-bold text-center uppercase tracking-wider text-foreground/70 group-hover:text-primary transition-colors">
                    {league.name.replace(/ /g, '\n')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
