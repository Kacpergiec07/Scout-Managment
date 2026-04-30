'use client'

import React, { useState, useRef, useEffect } from 'react'
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
import { getRecentJobs, completeJob, generateDraftJobAction, acceptJobAction, cancelJobAction, generatePackOfJobsAction } from '@/app/actions/job-generation'
import { COACH_MAP } from '@/lib/coaches-data'
import { toast } from 'sonner'
import { X, Check, ThumbsDown, Info, Trash2, Layers } from 'lucide-react'

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
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchJobs = async () => {
    setIsFetching(true)
    try {
      const recentJobs = await getRecentJobs(4)
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
              
              Evaluate the scout's proposal. 
              If the player matches the requirements, be positive and professional.
              If the player doesn't match, explain why briefly.
              Always keep the tone professional but demanding, like a top-tier football manager.
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

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-6 p-6">
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
          className="gap-2 border-secondary/20"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh List
        </Button>
        <Button 
          size="sm" 
          onClick={async () => {
            setIsGenerating(true)
            const result = await generateDraftJobAction()
            if (result.success && result.job) {
              setDraftJobs([result.job])
              setCurrentDraftIndex(0)
              setShowReview(true)
            } else {
              toast.error('Failed to generate draft: ' + result.error)
            }
            setIsGenerating(false)
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
            const result = await generatePackOfJobsAction()
            if (result.success && result.jobs) {
              setDraftJobs(result.jobs)
              setCurrentDraftIndex(0)
              setShowReview(true)
            } else {
              toast.error('Failed to generate pack: ' + result.error)
            }
            setIsGenerating(false)
          }} 
          disabled={isGenerating || isFetching}
          className="gap-2 border-secondary/20 hover:bg-secondary/10"
        >
          <Layers className="h-4 w-4" />
          Get 4 Specialized Offers
        </Button>
      </div>

      <Dialog open={showReview} onOpenChange={setShowReview}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border p-0 overflow-hidden rounded-3xl">
          {draftJobs.length > 0 && draftJobs[currentDraftIndex] && (
            <div className="flex flex-col h-full">
              <div className="bg-secondary/10 p-6 border-b border-secondary/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-white p-3 flex items-center justify-center shadow-xl border border-secondary/20">
                      <img 
                        src={draftJobs[currentDraftIndex].club.logo} 
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
                  <Badge className="bg-secondary/20 text-secondary hover:bg-secondary/30 border-secondary/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {draftJobs[currentDraftIndex].position}
                  </Badge>
                  <Badge variant={draftJobs[currentDraftIndex].priority === 'high' ? 'destructive' : 'secondary'} className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {draftJobs[currentDraftIndex].priority.toUpperCase()} PRIORITY
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
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-xs font-semibold">
                        <Check className="h-3 w-3 text-green-500" />
                        {req}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-muted/20 border-t border-border space-y-4">
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
                        className="h-10 rounded-xl text-[10px] font-bold border-border/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all gap-2"
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        {/* Left Column: Job List */}
        <div className="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
          <Card className="glass-panel border-border flex flex-col h-full bg-card/50">
            <CardHeader className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search offers..." 
                  className="pl-9 bg-background/50 border-border"
                />
              </div>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-320px)] p-4">
              <div className="space-y-3">
                {isFetching && jobs.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : jobs.length > 0 ? (
                  jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale:0.98 }}
                      onClick={() => handleSelectJob(job)}
                      className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                        selectedJob?.id === job.id 
                          ? 'bg-secondary/10 border-secondary shadow-[0_0_15px_rgba(var(--secondary-rgb),0.1)]' 
                          : 'bg-background/40 border-border hover:border-secondary/50 hover:bg-secondary/5'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-lg bg-white p-2 flex items-center justify-center shadow-sm border border-border/50 group-hover:border-secondary/50 transition-colors">
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
                            <Badge variant={job.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                              {job.priority.toUpperCase()}
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
                  <div className="text-center py-12 flex flex-col items-center gap-4">
                    <AlertCircle className="h-12 w-12 text-muted-foreground opacity-20" />
                    <p className="text-sm text-muted-foreground">No active jobs found. Head to Dashboard to generate some missions.</p>
                    <Link href="/dashboard">
                      <Button size="sm">Go to Dashboard</Button>
                    </Link>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* Right Column: Interaction/Chat */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedJob ? (
              <motion.div
                key={selectedJob.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-full gap-4"
              >
                {/* Manager Info & Header */}
                <Card className="glass-panel border-border bg-card/30">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-secondary shadow-lg">
                          <AvatarFallback className="bg-secondary text-secondary-foreground font-black">
                            {managerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
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
                          <Button variant="outline" size="sm" className="gap-2 border-secondary/20 hover:bg-secondary/10">
                            <SearchCode className="h-4 w-4" />
                            Scout Talent
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-card border-border p-6 rounded-3xl">
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
                          <div className="bg-muted/30 p-4 rounded-2xl border border-border/50">
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
                        <Button variant="outline" size="sm" className="gap-2 border-secondary/20 hover:bg-secondary/10">
                          <Building2 className="h-4 w-4" />
                          Club Info
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="gap-2 border-red-500/20 text-red-500 hover:bg-red-500/10"
                        onClick={async () => {
                          if (confirm('Are you sure you want to abandon this mission? Your reputation might be affected.')) {
                            const result = await cancelJobAction(selectedJob.id)
                            if (result.success) {
                              toast.success('Mission abandoned.')
                              setSelectedJob(null)
                              fetchJobs()
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
                        className="gap-2 bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 hover:bg-secondary/80"
                        onClick={async () => {
                          const result = await completeJob(selectedJob.id)
                          if (result.success) {
                            toast.success('Mission completed! You have earned reputation points.')
                            // Refresh jobs list
                            const updatedJobs = await getRecentJobs(10)
                            setJobs(updatedJobs)
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
                <Card className="flex-1 glass-panel border-border flex flex-col overflow-hidden bg-card/20 relative">
                  <div className="absolute inset-0 bg-grid-white/[0.02] -z-10" />
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                      {messages[selectedJob.id]?.map((m) => (
                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-3 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Avatar className="h-8 w-8 shrink-0 mt-1 border border-border">
                              {m.role === 'user' ? (
                                <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">YOU</AvatarFallback>
                              ) : (
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">{managerName[0]}</AvatarFallback>
                              )}
                            </Avatar>
                            <div className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                              <div className={`rounded-2xl px-4 py-3 text-sm shadow-sm transition-all ${
                                m.role === 'user'
                                  ? 'bg-primary text-primary-foreground rounded-tr-none'
                                  : 'bg-muted/80 backdrop-blur-md text-foreground rounded-tl-none border border-border/50'
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
                            <Avatar className="h-8 w-8 shrink-0 border border-border">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">{managerName[0]}</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted/80 backdrop-blur-md rounded-2xl rounded-tl-none px-4 py-3 border border-border/50 animate-pulse">
                              <div className="flex gap-1">
                                <div className="h-1.5 w-1.5 bg-secondary rounded-full animate-bounce" />
                                <div className="h-1.5 w-1.5 bg-secondary rounded-full animate-bounce delay-100" />
                                <div className="h-1.5 w-1.5 bg-secondary rounded-full animate-bounce delay-200" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={scrollRef} />
                    </div>
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="p-4 bg-muted/30 border-t border-border">
                    <form onSubmit={sendMessage} className="flex gap-3">
                      <div className="relative flex-1">
                        <Input 
                          placeholder="Type player name or scouting report..." 
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          disabled={isLoading}
                          className="pr-12 py-6 bg-background/50 border-border rounded-2xl focus-visible:ring-secondary transition-all"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-secondary animate-pulse' : 'bg-green-500'}`} />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="h-12 w-12 rounded-2xl bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 hover:scale-105 transition-all shrink-0"
                      >
                        <Send className="h-5 w-5" />
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full gap-6 text-center"
              >
                <div className="h-24 w-24 rounded-full bg-secondary/10 flex items-center justify-center relative">
                  <Briefcase className="h-10 w-10 text-secondary" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-secondary/20" 
                  />
                </div>
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold mb-2">Select a Job Offer</h2>
                  <p className="text-muted-foreground">
                    Elite clubs are waiting for your scouting expertise. Select an offer from the list to start a conversation with the club's board.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="p-4 rounded-xl border border-border bg-card/30 flex flex-col items-center gap-2">
                    <Target className="h-5 w-5 text-secondary" />
                    <span className="text-xs font-bold">Precise Data</span>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card/30 flex flex-col items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-secondary" />
                    <span className="text-xs font-bold">Direct Contact</span>
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
