'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Briefcase, Target, Clock, ArrowRight, CheckCircle, Trash2, User, Settings, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CardStack, CardStackItem } from '@/components/ui/card-stack'
import { generateJobOffer, getLatestJob, deleteJob, getRecentJobs } from '@/app/actions/job-generation'
import { ThemeToggle } from '@/components/theme-toggle'
import { CustomThemeDialog } from '@/components/custom-theme-dialog'

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
           animate={{ scale: isActive ? 1.15 : 1.0, y: isActive ? -8 : 0 }}
           transition={{ duration: 0.4, ease: "easeOut" }}
           className="w-16 h-16 md:w-22 md:h-22 bg-background/5 backdrop-blur-md rounded-full shadow-[0_0_30px_rgba(0,0,0,0.2)] flex items-center justify-center p-3.5 mt-[35%]"
         >
            <Image 
              src={league.logo} 
              alt="League Logo" 
              fill
              sizes="80px"
              loading="lazy"
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
    high: 'from-red-500/20 to-red-500/10 border-red-500/30 text-red-400',
    medium: 'from-amber-500/20 to-amber-500/10 border-amber-500/30 text-amber-400',
    low: 'from-emerald-500/20 to-emerald-500/10 border-emerald-500/30 text-emerald-400'
  }

  const getDifficulty = (job: JobOffer) => {
    let score = 0
    // Priority (Impact: 1 - 4)
    if (job.priority === 'high') score = 4
    else if (job.priority === 'medium') score = 2.5
    else score = 1
    
    // Requirements (Impact: 0.5 per req)
    score += (job.requirements.length * 0.5)
    
    // Club Rank / Prestige (Impact: 0 - 3)
    const eliteNames = ['Real Madrid', 'PSG', 'Paris Saint-Germain', 'Manchester City', 'Bayern', 'Liverpool', 'Barcelona', 'Inter', 'Arsenal', 'Manchester United', 'Man Utd', 'Chelsea', 'Juventus', 'Milan', 'Dortmund', 'Atletico', 'Tottenham', 'Napoli', 'Ajax', 'Benfica', 'Porto']
    
    const isElite = eliteNames.some(name => job.club.name.toLowerCase().includes(name.toLowerCase()))
    
    if (isElite) {
      score += 3
    } else if (job.requirements.length > 3) {
      score += 1.5 // Mid-tier bonus
    }
    
    return Math.min(10, score)
  }

  const difficultyScore = getDifficulty(job)
  const difficultyLabel = difficultyScore <= 4 ? 'EASY' : difficultyScore <= 7.5 ? 'MEDIUM' : 'HARD'

  return (
    <motion.div
      key={job.id}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
      className="w-full max-w-4xl mx-auto relative"
    >
      {/* Glow effect behind card */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-500/20 blur-3xl rounded-3xl -z-10" />

      <div className="premium-card bg-gradient-to-br from-card/95 via-card/90 to-card/80 backdrop-blur-2xl border border-border/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Animated shine effect - only on hover or periodically */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 8
          }}
        />

        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 opacity-50 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between mb-10">
          <div className="flex items-center gap-5">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-gradient-to-br from-primary/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border-2 border-primary/30 shadow-lg relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                whileHover={{
                  x: ['-100%', '100%']
                }}
                transition={{ duration: 0.7 }}
              />
              <Briefcase className="w-8 h-8 text-primary relative z-10" />
            </motion.div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-black uppercase tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                  Scouting Mission
                </h3>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="px-3 py-1 bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-full text-xs font-bold text-primary border border-primary/20"
                >
                  {currentIndex + 1}/{totalJobs}
                </motion.span>
              </div>
              <div className="text-sm text-muted-foreground font-medium tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI-Generated Assignment
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-2.5 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
              title="Delete Assignment"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
            {totalJobs > 1 && (
              <motion.button
                whileHover={{ scale: 1.1, x: 2 }}
                whileTap={{ scale: 0.9 }}
                onClick={onCycleJob}
                className="p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-primary/20"
                title="Next Assignment"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 45 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all border border-transparent hover:border-border"
              title="Close"
            >
              <ArrowRight className="w-5 h-5 rotate-45" />
            </motion.button>
          </div>
        </div>

        {/* Club Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-border/50 hover:border-primary/30 transition-all group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="flex items-center gap-6 relative z-10">
            {job.club.logo && (
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="w-20 h-20 relative bg-gradient-to-br from-white to-gray-100 rounded-2xl p-2 shadow-xl border-2 border-border/50 hover:border-primary/30 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
                <Image src={job.club.logo} alt={job.club.name} fill className="object-contain p-0.5" />
              </motion.div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-3xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {job.club.name}
                </h4>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-gradient-to-r ${priorityColors[job.priority]}`}
                >
                  {difficultyLabel} DIFFICULTY
                </motion.span>
              </div>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                {job.club.league}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Position and Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h5 className="font-bold uppercase tracking-wider text-sm text-primary">Target Position</h5>
            </div>
            <p className="text-2xl font-black uppercase tracking-tight text-primary group-hover:scale-105 transition-transform origin-left">
              {job.position}
            </p>
            <div className="h-0.5 w-0 bg-primary/50 mt-3 group-hover:w-full transition-all duration-300" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl p-6 border border-border/50 hover:border-border transition-all group hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <h5 className="font-bold uppercase tracking-wider text-sm">Deadline</h5>
            </div>
            <p className="text-2xl font-black uppercase tracking-tight text-foreground/90 group-hover:scale-105 transition-transform origin-left">
              {job.deadline}
            </p>
            <div className="h-0.5 w-0 bg-muted-foreground/50 mt-3 group-hover:w-full transition-all duration-300" />
          </motion.div>
        </div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 relative z-10"
        >
          <h5 className="font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-primary" />
            </div>
            Requirements
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {job.requirements.map((req, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center gap-3 bg-gradient-to-r from-muted/40 to-muted/20 rounded-xl p-4 border border-border/50 hover:border-primary/30 transition-all group hover:scale-[1.02]"
              >
                <motion.div
                  className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,255,136,0.5)]"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.2
                  }}
                />
                <span className="text-sm font-medium text-foreground/90">{req}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary/10 via-emerald-500/5 to-transparent rounded-2xl p-6 mb-8 border-l-4 border-primary relative overflow-hidden group relative z-10"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
            whileHover={{
              x: ['-100%', '100%']
            }}
            transition={{ duration: 1 }}
          />
          <p className="text-sm font-medium leading-relaxed text-foreground/90 relative z-10">
            {job.description}
          </p>
        </motion.div>

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10"
        >
          <Link href="/scout-jobs">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 bg-gradient-to-br from-primary to-emerald-600 border border-primary/30 rounded-2xl flex items-center justify-center gap-3 transition-all group relative overflow-hidden shadow-lg shadow-primary/20"
            >
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white/50 group-hover:w-full transition-all duration-300" />
              <span className="text-sm font-bold uppercase tracking-wider text-black">Start Conversation</span>
              <MessageSquare className="w-4 h-4 text-black group-hover:scale-110 transition-all" />
            </motion.button>
          </Link>

          <Link href="/watchlist">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 bg-gradient-to-br from-muted/50 to-muted/30 hover:from-muted hover:to-muted/70 border border-border/50 hover:border-primary/30 rounded-2xl flex items-center justify-center gap-3 transition-all group relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300" />
              <span className="text-sm font-bold uppercase tracking-wider text-foreground/90 group-hover:text-primary transition-colors">Watchlist</span>
              <ArrowRight className="w-4 h-4 text-foreground/70 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </motion.button>
          </Link>

          <Link href={`/teams/${job.club.id}`}>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-14 premium-btn flex items-center justify-center gap-3 transition-all group relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white/50 group-hover:w-full transition-all duration-300" />
              <span className="text-sm font-bold uppercase tracking-wider">Team Details</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </motion.div>
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
  const [isEliteMode, setIsEliteMode] = useState(false)
  const [showOnlyElite, setShowOnlyElite] = useState(true)

  useEffect(() => {
    const hasElite = allJobs.some(j => j.club.name === 'Real Madrid' || j.club.name === 'PSG')
    setIsEliteMode(hasElite)
  }, [allJobs])

  // Load all jobs from database on component mount
  useEffect(() => {
    const loadAllJobs = async () => {
      try {
        const jobs = await getRecentJobs(15)
        if (jobs.length > 0) {
          setAllJobs(jobs)
        }
      } catch (error) {
        console.error('Failed to load jobs:', error)
      }
    }

    loadAllJobs()
  }, [])

  const displayedJobs = useMemo(() => {
    // Sort first: Elite first, then by difficulty
    let sorted = [...allJobs].sort((a, b) => {
      const getScore = (j: JobOffer) => {
        let s = j.priority === 'high' ? 7 : j.priority === 'medium' ? 4 : 1
        if (j.club.name === 'Real Madrid' || j.club.name === 'PSG') s += 10
        return s
      }
      return getScore(b) - getScore(a)
    })

    // Apply elite filter if present and toggle is on
    const hasElite = sorted.some(j => j.club.name === 'Real Madrid' || j.club.name === 'PSG')
    if (hasElite && showOnlyElite) {
      sorted = sorted.filter(j => j.club.name === 'Real Madrid' || j.club.name === 'PSG')
    }

    return sorted
  }, [allJobs, showOnlyElite])

  useEffect(() => {
    if (displayedJobs.length > 0 && !currentJob) {
      setCurrentJob(displayedJobs[0])
      setCurrentJobIndex(0)
    }
  }, [displayedJobs])

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
          // Update the list but close the current view as requested
          setCurrentJobIndex(0)
          setCurrentJob(null)
          setShowJob(false)
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
    <div className={`relative w-full h-full font-sans flex flex-col items-center select-none overflow-y-auto overflow-x-hidden min-h-screen pb-20 transition-all duration-1000 ${
      isEliteMode ? 'bg-[#050505] text-amber-500 selection:bg-amber-500/30' : 'bg-background text-foreground'
    }`}>
      {/* Elite Mode Effects */}
      {isEliteMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.03),transparent)]" />
        </div>
      )}

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
          <div className="flex items-center gap-4">
          {isEliteMode && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={async () => {
                const eliteJobs = allJobs.filter(j => j.club.name === 'Real Madrid' || j.club.name === 'PSG');
                setAllJobs(prev => prev.filter(j => j.club.name !== 'Real Madrid' && j.club.name !== 'PSG'));
                setCurrentJob(null);
                setShowJob(false);
                
                for (const job of eliteJobs) {
                  await deleteJob(job.id); // deleteJob is the dashboard's cancel equivalent
                }
              }}
              className="hidden sm:flex items-center gap-2 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-xl h-9 text-[10px] font-black uppercase tracking-widest"
            >
              <Crown className="h-3 w-3" />
              Return to Normal
            </Button>
          )}
          <CustomThemeDialog />
          <ThemeToggle />
        </div>
      </div>
    </nav>

      <main className="w-full max-w-[1400px] mt-32 px-6 space-y-16 relative z-10">
        {/* Application Description */}
        <div className="text-center space-y-6 py-12 relative">
          {/* Animated background elements */}
          <motion.div
            className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -top-10 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-block mb-6"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">AI-Powered Platform</span>
                </div>
              </motion.div>
            </div>

            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase text-foreground leading-[0.85] mb-6">
              PROFESSIONAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-emerald-500 to-emerald-900 animate-gradient bg-[length:200%_auto]">SCOUTING</span>
            </h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                Scout Pro is an advanced platform designed for professional football scouts.
                Search and analyze players from top European leagues, compare performances,
                track transfers, and receive AI-generated scouting assignments tailored to club needs.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                {[
                  { text: "Player Search & Analysis", icon: "🔍" },
                  { text: "Performance Comparison", icon: "📊" },
                  { text: "Transfer Intelligence", icon: "💰" },
                  { text: "AI-Powered Insights", icon: "🤖" }
                ].map((item, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="px-4 py-2 bg-primary/10 rounded-full border border-primary/20 text-primary hover:bg-primary/20 hover:scale-105 transition-all cursor-default"
                  >
                    {item.icon} {item.text}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Job Generation Section */}
        <div className="w-full space-y-8 relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-3xl blur-2xl" />

          <div className="relative z-10">
            <div className="text-center space-y-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-2xl border border-primary/20">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">
                      Receive New Assignment
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      AI-Powered Scouting Missions
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed"
              >
                Click below to generate a new scouting mission. Our AI will analyze club needs from top 5 European leagues and create a tailored assignment for you.
              </motion.p>
            </div>

          <div className="flex justify-center">
            <motion.button
              onClick={handleGenerateJob}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="premium-btn h-16 px-12 text-base font-bold tracking-wider rounded-2xl flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {/* Animated underline on hover */}
              <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-white/50 group-hover:w-full transition-all duration-300" />
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-white/80 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                <JobOfferPanel
                  job={currentJob}
                  onClose={handleCloseJob}
                  onDelete={handleDeleteJob}
                  onCycleJob={handleCycleJob}
                  currentIndex={currentJobIndex}
                  totalJobs={allJobs.length}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>

        {/* Available Leagues Quick Access */}
        <div className="w-full space-y-6 pt-8 border-t border-border relative">
          {/* Section decoration */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-3 w-16 h-1 bg-gradient-to-r from-primary to-emerald-500 rounded-full" />

          <div className="text-center space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                Available Leagues
              </h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Top 5 European Football Leagues
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {initialLeagues.map((league, idx) => (
              <Link
                key={league.id}
                href={`/leagues?sId=${league.id}`}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: idx * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  className="relative bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-6 overflow-hidden hover:border-primary/50 transition-all duration-300"
                  whileHover={{ y: -8, scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Background gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${league.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${league.color} opacity-0 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

                  {/* Logo container with enhanced effects */}
                  <div className="relative z-10">
                    <motion.div
                      className="w-16 h-16 relative mx-auto mb-4"
                      whileHover={{
                        rotate: [0, 5, -5, 0],
                        scale: 1.1
                      }}
                      transition={{
                        duration: 0.4,
                        ease: "easeInOut"
                      }}
                    >
                      {/* Glow ring */}
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${league.color} blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300`} />

                      {/* Logo background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl border-2 border-border/50 group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
                        {/* Subtle pattern */}
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '8px 8px' }} />

                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent" />

                        {/* Logo image */}
                        <div className="absolute inset-2 rounded-xl overflow-hidden">
                          <Image
                            src={league.logo}
                            alt={league.name}
                            fill
                            className="object-contain p-1 drop-shadow-md"
                          />
                        </div>
                      </div>

                      {/* Corner accents */}
                      <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-300`} />
                      <div className={`absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-300`} />
                      <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-300`} />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary/0 group-hover:border-primary/60 transition-colors duration-300`} />
                    </motion.div>

                    {/* League name with enhanced typography */}
                    <motion.div
                      className="text-center space-y-2"
                      whileHover={{ y: -2 }}
                    >
                      <p className="text-[10px] font-black text-center uppercase tracking-[0.15em] text-foreground/60 group-hover:text-primary transition-colors duration-300 leading-tight">
                        {league.name.replace(/ /g, ' ')}
                      </p>

                      {/* Animated underline */}
                      <div className="h-0.5 w-0 mx-auto bg-gradient-to-r from-primary to-emerald-400 group-hover:w-full transition-all duration-300" />

                      {/* Club count indicator */}
                      {league.clubs && league.clubs.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="flex items-center justify-center gap-1 mt-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                            {league.clubs.length} Clubs
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  </div>


                  {/* Hover spotlight effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
