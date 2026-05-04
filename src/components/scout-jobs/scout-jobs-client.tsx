'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, 
  ChevronRight, 
  Send, 
  User, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Target,
  Trophy,
  Star,
  Search,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  SearchCode
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import confetti from 'canvas-confetti'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlayerSearch } from '@/components/scout/player-search'
import ReactMarkdown from 'react-markdown'
import { getRecentJobs, completeJob, generateDraftJobAction, acceptJobAction, cancelJobAction, generatePackOfJobsAction, generateEliteJobsAction } from '@/app/actions/job-generation'
import { COACH_MAP } from '@/lib/coaches-data'
import { toast } from 'sonner'
import { X, Check, ThumbsDown, Info, Trash2, Layers, Crown } from 'lucide-react'

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
  status?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ScoutJobsClient() {
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [draftJobs, setDraftJobs] = useState<JobOffer[]>([])
  const [currentDraftIndex, setCurrentDraftIndex] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showAppreciation, setShowAppreciation] = useState(false)
  const [isEliteMode, setIsEliteMode] = useState(false)
  const [showOnlyElite, setShowOnlyElite] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [reputation, setReputation] = useState<number>(0)
  
  // Load reputation from localStorage
  useEffect(() => {
    const savedRep = localStorage.getItem('scout_reputation')
    if (savedRep) {
      setReputation(parseInt(savedRep))
    } else {
      setReputation(50) // Default starting rep
      localStorage.setItem('scout_reputation', '50')
    }
  }, [])

  // Update reputation helper
  const updateReputation = (amount: number) => {
    setReputation(prev => {
      const newRep = Math.max(0, Math.min(100, prev + amount))
      localStorage.setItem('scout_reputation', newRep.toString())
      return newRep
    })
  }

  // Calculate difficulty for a job (1-10 scale)
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
      score += 1.5 // Significant mid-tier bonus
    }
    
    return Math.min(10, score)
  }

  const fetchJobs = async () => {
    setIsFetching(true)
    try {
      const recentJobs = await getRecentJobs(10) // Increased limit to ensure elite ones are always found
      setJobs(recentJobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    const hasEliteClubs = jobs.some(j => j.club.name === 'Real Madrid' || j.club.name === 'PSG')
    setIsEliteMode(hasEliteClubs)
  }, [jobs])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, selectedJob, isLoading])

  const getManagerName = (clubId: string, clubName: string) => {
    return COACH_MAP[clubId] || `Manager of ${clubName}`
  }

  const handleSelectJob = (job: JobOffer) => {
    setSelectedJob(job)
    const managerName = getManagerName(job.club.id, job.club.name)
    if (!messages[job.id]) {
      setMessages(prev => ({
        ...prev,
        [job.id]: [
          {
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I'm **${managerName}**, manager of **${job.club.name}**. \n\nWe are looking for a **${job.position}**. \n\nRequirements:\n${job.requirements.map(r => `- ${r}`).join('\n')}\n\nDo you have any suggestions for us?`,
            timestamp: new Date()
          }
        ]
      }))
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !selectedJob || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => ({
      ...prev,
      [selectedJob.id]: [...(prev[selectedJob.id] || []), userMessage]
    }))
    
    const currentInput = input
    setInput('')

    // COMMAND: New Mission Request
    if (currentInput.toLowerCase().includes('nowe zadanie') || 
        currentInput.toLowerCase().includes('new mission') || 
        currentInput.toLowerCase().includes('szukam pracy')) {
      setIsGenerating(true)
      const result = await generateDraftJobAction()
      if (result.success && result.job) {
        setDraftJobs([result.job])
        setCurrentDraftIndex(0)
        setShowReview(true)
        toast.success("Board has a new request for you!", { icon: '💼' })
      }
      setIsGenerating(false)
      return
    }

    setIsLoading(true)

    const managerName = getManagerName(selectedJob.club.id, selectedJob.club.name)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are ${managerName}, the manager of ${selectedJob.club.name}. 
              A scout is proposing a player to you for the position of ${selectedJob.position}.
              Job details: ${selectedJob.description}.
              Requirements: ${selectedJob.requirements.join(', ')}.
              
              Evaluate the scout's proposal extremely strictly. 
              Only if the player is a near-perfect fit (90%+ match) for ALL requirements,
              start your response with "PERFECT MATCH: [percentage]%".
              Example: "PERFECT MATCH: 95%. This is exactly what we need!"
              
              If they are a good fit (70-89%), use "GOOD FIT: [percentage]%".
              If they are below 70%, be critical and explain why they don't fit.
              
              Tone: Professional, demanding, but appreciative of high quality.
              Respond in the same language as the scout.`
            },
            ...(messages[selectedJob.id] || []).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: currentInput }
          ]
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let assistantContent = ''
      const assistantMessageId = (Date.now() + 1).toString()

      setMessages(prev => ({
        ...prev,
        [selectedJob.id]: [...(prev[selectedJob.id] || []), { 
          id: assistantMessageId, 
          role: 'assistant', 
          content: '', 
          timestamp: new Date() 
        }]
      }))

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        
        setMessages(prev => ({
          ...prev,
          [selectedJob.id]: prev[selectedJob.id].map(m => 
            m.id === assistantMessageId ? { ...m, content: assistantContent } : m
          )
        }))
      }

      // Check for strict success markers (90%+)
      const upperContent = assistantContent.toUpperCase()
      if (upperContent.includes('PERFECT MATCH')) {
        // Trigger confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00ff00', '#ffffff', '#004400']
        })
        
        setShowAppreciation(true)
        setTimeout(() => setShowAppreciation(false), 4000)

        toast.success('The manager is impressed! Reputation increased (+10)!', {
          icon: '🏆',
          duration: 5000
        })
        updateReputation(10)
      } else if (upperContent.includes('GOOD FIT')) {
        toast.info('Good suggestion. The manager is interested.', {
          icon: '📊'
        })
        updateReputation(2)
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => ({
        ...prev,
        [selectedJob.id]: [...(prev[selectedJob.id] || []), {
          id: 'error',
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }]
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const managerName = selectedJob ? getManagerName(selectedJob.club.id, selectedJob.club.name) : 'Manager'

  const hasEliteActive = jobs.some(j => j.club.name === 'Real Madrid' || j.club.name === 'PSG')

  const sortedJobs = useMemo(() => {
    // Filter logic: if elite offers (Real/PSG) are present, show ONLY them to focus the scout
    let displayJobs = [...jobs]
    
    if (hasEliteActive && showOnlyElite) {
      displayJobs = jobs.filter(j => j.club.name === 'Real Madrid' || j.club.name === 'PSG')
    }

    return displayJobs.sort((a, b) => {
      const diffA = getDifficulty(a)
      const diffB = getDifficulty(b)
      if (diffA !== diffB) return diffB - diffA // Hardest first
      
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime() // Closest deadline first
    })
  }, [jobs, showOnlyElite])

  return (
    <div className={`flex flex-col h-[calc(100vh-100px)] gap-6 p-6 transition-all duration-1000 relative overflow-hidden ${
      isEliteMode 
        ? 'bg-[#0a0a0a] text-amber-500' 
        : 'bg-background'
    }`}>
      {/* Premium Elite Background Effects */}
      {isEliteMode && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-600/5 blur-[150px] rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,191,0,0.05),transparent)]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/[0.02] to-transparent" />
        </div>
      )}
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tighter text-foreground flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-secondary" />
            SCOUT JOBS
          </h1>
        </div>
        <p className="text-muted-foreground">Work with elite clubs and provide the best talent suggestions.</p>
      </div>

      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchJobs} 
          disabled={isFetching || isGenerating}
          className="gap-2 bg-secondary/5 border-none hover:bg-secondary/10"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh List
        </Button>
        <Button 
          size="sm" 
          onClick={async () => {
            setIsGenerating(true)
            const generatePromise = async () => {
              try {
                const result = await generateDraftJobAction()
                if (!result.success || !result.job) {
                  throw new Error(result.error || 'Failed to generate')
                }
                setDraftJobs([result.job])
                setCurrentDraftIndex(0)
                setShowReview(true)
                return result.job
              } finally {
                setIsGenerating(false)
              }
            }

            toast.promise(generatePromise(), {
              loading: 'Scanning market for new opportunities...',
              success: 'New scouting mission available!',
              error: (err) => `Error: ${err.message}`
            })
          }} 
          disabled={isGenerating || isFetching}
          className="gap-2 bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 hover:scale-105 transition-all"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Target className="h-4 w-4" />
          )}
          Find New Talent Request
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={async () => {
            setIsGenerating(true)
            const generatePromise = async () => {
              try {
                const result = await generateEliteJobsAction()
                if (!result.success || !result.jobs) {
                  throw new Error(result.error || 'Failed to generate')
                }
                setDraftJobs(result.jobs)
                setCurrentDraftIndex(0)
                setShowReview(true)
                return result.jobs
              } finally {
                setIsGenerating(false)
              }
            }

            toast.promise(generatePromise(), {
              loading: 'Contacting world-class representatives...',
              success: 'Real Madrid and PSG have sent you urgent requests!',
              error: (err) => `Failed: ${err.message}`
            })
          }} 
          disabled={isGenerating || isFetching}
          className="gap-2 border-none bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 font-bold"
        >
          <Crown className="h-4 w-4 text-yellow-500" />
          Get 2 Elite Offers
        </Button>
        <div className="flex-1" />
        
        {/* Trust Bar Section */}
        <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 bg-card/20 backdrop-blur-3xl rounded-[1.2rem] shadow-xl group transition-all duration-500">
          <div className="flex flex-col gap-1.5 min-w-[140px]">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                   <Star className="h-3 w-3 text-secondary fill-secondary/20" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70 group-hover:text-foreground transition-colors">Trust Level</span>
                </div>
                <span className="text-[10px] font-black text-secondary tabular-nums">{reputation}%</span>
             </div>
             <div className="h-2 w-full bg-secondary/5 rounded-full overflow-hidden p-[1px] shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${reputation}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  className="h-full bg-gradient-to-r from-secondary/40 via-secondary to-emerald-400 rounded-full shadow-[0_0_15px_rgba(var(--secondary-rgb),0.3)] relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-shimmer" />
                </motion.div>
             </div>
          </div>
          <div className="w-px h-8 bg-foreground/5 mx-1" />
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-500 animate-ping opacity-20" />
            </div>
            <span className="text-[10px] font-black tracking-[0.2em] text-foreground/40 uppercase">Live Network</span>
          </div>
        </div>
      </div>

      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="sm:max-w-[500px] bg-card border-none p-0 overflow-hidden rounded-3xl shadow-2xl">
          <DialogTitle className="sr-only">Scouting Mission Review</DialogTitle>
          <DialogDescription className="sr-only">Review the details of the scouting mission before accepting.</DialogDescription>
          {draftJobs.length > 0 && draftJobs[currentDraftIndex] && (
            <div className="flex flex-col h-full">
              <div className="bg-secondary/5 p-6 border-none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white p-3 flex items-center justify-center shadow-xl">
                      <img 
                        src={draftJobs[currentDraftIndex].club.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(draftJobs[currentDraftIndex].club.name)}&background=secondary&color=fff`} 
                        alt={draftJobs[currentDraftIndex].club.name} 
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(draftJobs[currentDraftIndex].club.name)}&background=secondary&color=fff`
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black tracking-tighter text-foreground">{draftJobs[currentDraftIndex].club.name}</h3>
                      <p className="text-sm font-bold text-secondary flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {draftJobs[currentDraftIndex].club.league}
                      </p>
                    </div>
                  </div>
                  {draftJobs.length > 1 && (
                    <Badge className="bg-secondary text-secondary-foreground">
                      {currentDraftIndex + 1} / {draftJobs.length}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border-none">
                    {draftJobs[currentDraftIndex].position}
                  </Badge>
                  <Badge 
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border-none ${
                      getDifficulty(draftJobs[currentDraftIndex]) > 4 && getDifficulty(draftJobs[currentDraftIndex]) <= 7.5 ? 'text-yellow-500 bg-yellow-500/10' : ''
                    }`}
                  >
                    {getDifficulty(draftJobs[currentDraftIndex]) <= 4 ? 'EASY' : getDifficulty(draftJobs[currentDraftIndex]) <= 7.5 ? 'MEDIUM' : 'HARD'} DIFFICULTY
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Board Request
                  </h4>
                  <p className="text-sm font-medium leading-relaxed italic text-foreground/80">
                    "{draftJobs[currentDraftIndex].description}"
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                    <Target className="h-3 w-3" />
                    Specific Requirements
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {draftJobs[currentDraftIndex].requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 text-xs font-semibold">
                        <Check className="h-3 w-3 text-green-500" />
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/10 space-y-4">
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 h-12 rounded-2xl"
                    onClick={async () => {
                      const result = await acceptJobAction(draftJobs[currentDraftIndex]);
                      if (result.success) {
                        toast.success('Agreement signed!');
                        if (currentDraftIndex < draftJobs.length - 1) {
                          setCurrentDraftIndex(prev => prev + 1);
                        } else {
                          setShowReview(false);
                          fetchJobs();
                        }
                      } else {
                        toast.error('Legal error: ' + result.error);
                      }
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Accept Mission
                  </Button>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Or skip/reject:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Low Reputation', icon: <Star className="h-3 w-3" /> },
                      { label: 'Too Difficult', icon: <AlertCircle className="h-3 w-3" /> },
                      { label: 'Small Budget', icon: <Trophy className="h-3 w-3" /> },
                      { label: 'Not Interested', icon: <ThumbsDown className="h-3 w-3" /> }
                    ].map((reason) => (
                      <Button
                        key={reason.label}
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-xl text-[10px] font-bold border-none hover:bg-red-500/20 hover:text-red-500 transition-all gap-2"
                        onClick={() => {
                          toast.error(`Offer skipped: ${reason.label}`);
                          if (currentDraftIndex < draftJobs.length - 1) {
                            setCurrentDraftIndex(prev => prev + 1);
                          } else {
                            setShowReview(false);
                            fetchJobs();
                          }
                        }}
                      >
                        {reason.icon}
                        {reason.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Column: Job List */}
        <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 h-full overflow-hidden">
          {hasEliteActive && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-500/20 via-amber-400/5 to-transparent rounded-3xl p-4 flex items-center justify-between shadow-[0_8px_32px_rgba(245,158,11,0.05)] backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Crown className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-sm font-black italic uppercase tracking-tighter text-amber-500">Priority Missions</h3>
                  <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest leading-none">
                    {showOnlyElite ? 'Elite Focus Mode' : 'Showing All Missions'}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  const eliteJobs = jobs.filter(j => j.club.name === 'Real Madrid' || j.club.name === 'PSG');
                  // Remove from state immediately for snappy UI
                  setJobs(prev => prev.filter(j => j.club.name !== 'Real Madrid' && j.club.name !== 'PSG'));
                  setSelectedJob(null);
                  toast.info('Elite missions dismissed. Returning to standard market.');
                  
                  // Also cancel them in the background so they don't persist
                  for (const job of eliteJobs) {
                    await cancelJobAction(job.id);
                  }
                }}
                className="h-8 rounded-xl border-none bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-[10px] font-black uppercase tracking-widest"
              >
                Return to Normal
              </Button>
            </motion.div>
          )}

          <Card className={`border-none ring-0 shadow-none flex flex-col h-full min-h-0 ${hasEliteActive ? 'bg-amber-950/5 shadow-[0_20px_80px_rgba(0,0,0,0.2)]' : 'bg-card/20'}`}>
            <CardHeader className="p-4 shrink-0">
                <div className="flex items-center justify-between px-3 py-2 bg-secondary/5 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-secondary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary/80">Sort: Priority & Date</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary/30" />
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary/30" />
                  </div>
                </div>
            </CardHeader>
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full p-4">
              <div className="space-y-3">
                {isFetching && jobs.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : sortedJobs.length > 0 ? (
                  sortedJobs.map((job) => (
                    <motion.div
                      key={job.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale:0.98 }}
                      onClick={() => handleSelectJob(job)}
                      className={`group cursor-pointer p-4 rounded-2xl transition-all duration-500 ${
                        selectedJob?.id === job.id 
                          ? 'bg-secondary/20 shadow-[0_10px_30px_rgba(var(--secondary-rgb),0.15)]' 
                          : 'bg-background/20 hover:bg-secondary/10'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white p-2 flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                          {job.club.logo && job.club.logo !== "" ? (
                            <img 
                              src={job.club.logo} 
                              alt={job.club.name} 
                              className="h-full w-full object-contain filter drop-shadow-sm" 
                              onError={(e) => {
                                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.club.name)}&background=secondary&color=fff`
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-secondary/10 text-secondary font-black text-xs">
                              {job.club.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-bold text-sm truncate">{job.club.name}</h3>
                            <Badge 
                               className={`text-[9px] font-black px-2 py-0 rounded-full border-none ${
                                 getDifficulty(job) > 4 && getDifficulty(job) <= 7.5 ? 'text-yellow-500 bg-yellow-500/10' : ''
                               }`}
                             >
                               {getDifficulty(job) <= 4 ? 'EASY' : getDifficulty(job) <= 7.5 ? 'MEDIUM' : 'HARD'}
                             </Badge>
                          </div>
                          <p className="text-xs font-semibold text-foreground mb-1 truncate">{job.position}</p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {job.deadline}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-secondary">
                              {job.club.league}
                            </span>
                          </div>
                          
                        </div>
                        <ChevronRight className={`h-5 w-5 transition-transform ${selectedJob?.id === job.id ? 'translate-x-1 text-secondary' : 'text-muted-foreground'}`} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in duration-500">
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full" />
                      <div className="relative h-24 w-24 rounded-3xl bg-secondary/5 flex items-center justify-center shadow-2xl">
                        <Briefcase className="h-12 w-12 text-secondary animate-pulse" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-background flex items-center justify-center shadow-xl">
                        <Search className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black tracking-tight text-foreground mb-2 italic uppercase">No Missions Active</h3>
                    <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed mb-8">
                      Your scouting dashboard is empty. The world's top clubs are waiting for your elite analysis.
                    </p>
                    <div className="flex flex-col w-full gap-3">
                      <Button 
                        variant="default"
                        size="lg"
                        className="w-full rounded-2xl bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black uppercase tracking-widest shadow-lg shadow-secondary/20 h-14"
                        onClick={async () => {
                          setIsGenerating(true)
                          try {
                            const result = await generatePackOfJobsAction()
                            if (result.success && result.jobs) {
                              setDraftJobs(result.jobs)
                              setCurrentDraftIndex(0)
                              setShowReview(true)
                            }
                          } finally {
                            setIsGenerating(false)
                          }
                        }}
                      >
                        Find New Projects
                      </Button>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        Or use the "Elite Offers" button above
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Card>
        </div>

        {/* Right Column: Interaction/Chat */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0 h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full gap-4 min-h-0"
              >
                {/* Manager Info & Header */}
                <Card className="border-none ring-0 shadow-xl bg-card/20 backdrop-blur-3xl shrink-0 rounded-[2rem]">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <Avatar className="h-14 w-14 shadow-2xl">
                          <AvatarFallback className="bg-secondary text-secondary-foreground font-black text-lg">
                            {managerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 shadow-lg" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg leading-tight">{managerName}</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {selectedJob.club.logo && selectedJob.club.logo !== "" ? (
                            <img 
                              src={selectedJob.club.logo} 
                              alt={selectedJob.club.name} 
                              className="h-4 w-4 object-contain mr-1"
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : null}
                          Head Manager at {selectedJob.club.name}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 border-none bg-secondary/10 hover:bg-secondary/20">
                            <SearchCode className="h-4 w-4" />
                            Scout Talent
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-card border-none p-6 rounded-3xl shadow-2xl">
                          <DialogHeader className="mb-4">
                            <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
                              <Target className="h-6 w-6 text-secondary" />
                              TALENT SEARCH ENGINE
                            </DialogTitle>
                            <DialogDescription className="font-medium">
                              Searching for a <b>{selectedJob.position}</b> for <b>{selectedJob.club.name}</b>.
                              Select a player to suggest them to the manager.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <PlayerSearch 
                              placeholder={`Search for a ${selectedJob.position}...`}
                              initialQuery=""
                              context={{
                                position: selectedJob.position,
                                requirements: selectedJob.requirements
                              }}
                              onSelect={(player) => {
                                setInput(prev => `${prev} I would like to propose **${player.fullName}** (${player.position}) from ${player.teamName || 'Free Agent'}.`);
                                setIsSearchOpen(false);
                              }}
                            />
                          </div>
                          <div className="bg-muted/20 p-4 rounded-2xl">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">Job Requirements:</h4>
                            <ul className="text-xs space-y-1">
                              {selectedJob.requirements.map((req, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <div className="h-1 w-1 rounded-full bg-secondary" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Link href={`/teams/${selectedJob.club.id}`}>
                        <Button variant="outline" size="sm" className="gap-2 border-none bg-secondary/10 hover:bg-secondary/20">
                          <Building2 className="h-4 w-4" />
                          Club Info
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-2 border-none bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all active:scale-95"
                        onClick={async () => {
                          if (confirm('Are you sure you want to abandon this mission? Your reputation will decrease by 10 points.')) {
                            const result = await cancelJobAction(selectedJob.id)
                            if (result.success) {
                              toast.warning('Mission abandoned. Reputation -10', {
                                icon: <ThumbsDown className="h-4 w-4 text-red-500" />
                              })
                              updateReputation(-10)
                              setJobs(prev => prev.filter(j => j.id !== selectedJob.id))
                              setSelectedJob(null)
                            } else {
                              toast.error('Failed to cancel mission: ' + result.error)
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Abandon
                      </Button>
                      <Button 
                        size="sm" 
                        className="gap-2 bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 hover:bg-secondary/80 transition-all active:scale-95"
                        onClick={async () => {
                          const result = await completeJob(selectedJob.id)
                          if (result.success) {
                            toast.success('Mission completed! Reputation +15', {
                              icon: <Trophy className="h-4 w-4 text-yellow-500" />
                            })
                            updateReputation(15)
                            setJobs(prev => prev.filter(j => j.id !== selectedJob.id))
                            setSelectedJob(null)
                          } else {
                            toast.error('Failed to complete mission: ' + result.error)
                          }
                        }}
                      >
                        <Trophy className="h-4 w-4" />
                        Complete Mission
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="flex-1 border-none ring-0 flex flex-col overflow-hidden bg-card/10 relative min-h-0 rounded-[2.5rem] shadow-2xl">
                  <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      {messages[selectedJob.id]?.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className="h-9 w-9 shrink-0 mt-1 shadow-md">
                              {m.role === 'user' ? (
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">YOU</AvatarFallback>
                              ) : (
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px] font-bold">{managerName[0]}</AvatarFallback>
                              )}
                            </Avatar>
                            <div className={`flex flex-col gap-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`rounded-[1.5rem] px-5 py-4 text-sm shadow-xl transition-all backdrop-blur-xl ${
                                m.role === 'user'
                                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                                  : 'bg-muted/40 text-foreground rounded-tl-none'
                              }`}>
                                <div className="prose dark:prose-invert prose-sm max-w-none">
                                  <ReactMarkdown>{m.content}</ReactMarkdown>
                                </div>
                              </div>
                              <span className="text-[10px] text-muted-foreground px-1 uppercase tracking-tighter">
                                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {isLoading && !messages[selectedJob.id]?.[messages[selectedJob.id].length-1]?.content && (
                        <div className="flex justify-start">
                          <div className="flex gap-3 max-w-[80%]">
                            <Avatar className="h-9 w-9 shrink-0 shadow-md">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px] font-bold">{managerName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted/30 backdrop-blur-xl rounded-[1.5rem] rounded-tl-none px-5 py-4 animate-pulse">
                              <div className="flex gap-1.5">
                                <div className="h-2 w-2 bg-secondary rounded-full animate-bounce" />
                                <div className="h-2 w-2 bg-secondary rounded-full animate-bounce delay-100" />
                                <div className="h-2 w-2 bg-secondary rounded-full animate-bounce delay-200" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={scrollRef} />
                    </div>
                  </ScrollArea>
                </div>

                  {/* Input Area */}
                  <div className="p-6 shrink-0">
                    <form onSubmit={sendMessage} className="flex gap-4">
                      <div className="relative flex-1">
                        <Input 
                          placeholder="Type player name or scouting report..." 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={isLoading}
                          className="pr-12 py-7 bg-background/20 border-none rounded-[1.5rem] focus-visible:ring-0 focus-visible:ring-offset-0 transition-all shadow-inner backdrop-blur-xl text-base"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <div className={`h-2.5 w-2.5 rounded-full ${isLoading ? 'bg-secondary animate-pulse' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="h-14 w-14 rounded-[1.2rem] bg-secondary text-secondary-foreground shadow-2xl shadow-secondary/30 hover:scale-110 transition-all shrink-0 active:scale-95"
                      >
                        <Send className="h-6 w-6" />
                      </Button>
                    </form>
                    <p className="text-[10px] text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      AI will analyze your suggestion based on club requirements.
                    </p>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full gap-8 text-center px-6"
              >
                {jobs.length === 0 ? (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-secondary/10 blur-[100px] rounded-full animate-pulse" />
                      <div className="relative h-40 w-40 rounded-[3rem] bg-card/20 flex items-center justify-center shadow-2xl backdrop-blur-xl group">
                        <motion.div
                          animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                          }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Briefcase className="h-20 w-20 text-muted-foreground/30 group-hover:text-secondary/40 transition-colors duration-500" />
                        </motion.div>
                        <div className="absolute inset-0 rounded-[3rem] pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="max-w-xl space-y-6">
                      <div className="space-y-2">
                        <h2 className="text-5xl font-black italic tracking-tighter uppercase bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
                          Market Dormant
                        </h2>
                        <div className="h-1 w-20 bg-secondary mx-auto rounded-full" />
                      </div>
                      
                      <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-md mx-auto">
                        Your scouting network is currently idle. No active recruitment missions or elite offers detected in your dashboard.
                      </p>
                      
                      <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                          size="lg"
                          className="rounded-2xl h-16 px-10 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black uppercase tracking-widest text-base shadow-xl shadow-secondary/20 group"
                          onClick={async () => {
                            setIsGenerating(true)
                            try {
                              const result = await generatePackOfJobsAction()
                              if (result.success && result.jobs) {
                                setDraftJobs(result.jobs)
                                setCurrentDraftIndex(0)
                                setShowReview(true)
                              }
                            } finally {
                              setIsGenerating(false)
                            }
                          }}
                        >
                          <RefreshCw className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                          Initialize Market
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-24 w-24 rounded-full bg-secondary/10 flex items-center justify-center relative">
                      <Briefcase className="h-10 w-10 text-secondary" />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(var(--secondary-rgb),0.1)]" 
                      />
                    </div>
                    <div className="max-w-md">
                      <h2 className="text-3xl font-black italic uppercase tracking-tight mb-2">Selection Required</h2>
                      <p className="text-muted-foreground font-medium">
                        You have <span className="text-foreground font-bold">{jobs.length} active missions</span>. Select one from the list to begin your technical analysis and talent identification.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                      <div className="p-4 rounded-2xl bg-card/20 flex flex-col items-center gap-2 backdrop-blur-sm">
                        <Target className="h-5 w-5 text-secondary" />
                        <span className="text-xs font-bold uppercase tracking-wider">Precise Data</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-card/20 flex flex-col items-center gap-2 backdrop-blur-sm">
                        <MessageSquare className="h-5 w-5 text-secondary" />
                        <span className="text-xs font-bold uppercase tracking-wider">Direct Contact</span>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Appreciation Overlay */}
          <AnimatePresence>
            {showAppreciation && selectedJob && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-background/80 backdrop-blur-xl rounded-[40px] p-12 shadow-[0_0_50px_rgba(var(--secondary-rgb),0.3)] flex flex-col items-center gap-6 max-w-lg text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="h-32 w-32 rounded-3xl bg-white p-4 shadow-2xl"
                  >
                    <img 
                      src={selectedJob.club.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedJob.club.name)}&background=secondary&color=fff`} 
                      alt={selectedJob.club.name} 
                      className="h-full w-full object-contain"
                    />
                  </motion.div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter text-foreground mb-2">CLUB SAYS THANK YOU!</h2>
                    <p className="text-xl font-bold text-secondary">"This is exactly what we were looking for. Great job, Scout!"</p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className="h-8 w-8 text-yellow-500 fill-yellow-500 animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
