'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Target, 
  Shield, 
  Zap, 
  Activity, 
  Search, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileUp,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { searchPlayersAction } from '@/app/actions/statorium'
import Image from 'next/image'

type Step = 'basic' | 'stats' | 'style' | 'confirm'

export default function NewAnalysisPage() {
  const router = useRouter()
  const [step, setStep] = React.useState<Step>('basic')
  const [loading, setLoading] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  // Form State
  const [formData, setFormData] = React.useState({
    id: '',
    name: '',
    age: '23',
    nationality: '',
    position: 'ST',
    club: '',
    league: 'Premier League',
    photoUrl: '',
    stats: {
      offensive: { goals: 50, assists: 50, xG: 50, xA: 50, keyPasses: 50 },
      defensive: { tackles: 50, interceptions: 50, aerialWins: 50, clearances: 50 },
      physical: { distance: 50, sprints: 50, stamina: 50 },
      tactical: { dribbles: 50, progressivePasses: 50, passAccuracy: 50, pressing: 50 }
    }
  })

  // Handle player search
  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true)
        const results = await searchPlayersAction(searchQuery)
        setSearchResults(results)
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const selectPlayer = (player: any) => {
    setFormData({
      ...formData,
      id: player.playerID,
      name: player.fullName,
      nationality: player.country || '',
      position: player.position || 'ST',
      photoUrl: player.playerPhoto || '',
      club: player.teamName || '',
    })
    setSearchQuery('')
    setSearchResults([])
  }

  const updateStat = (category: string, key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [category]: {
          ...(prev.stats as any)[category],
          [key]: value
        }
      }
    }))
  }

  const handleNext = () => {
    if (step === 'basic') setStep('stats')
    else if (step === 'stats') setStep('style')
    else if (step === 'style') setStep('confirm')
  }

  const handleBack = () => {
    if (step === 'stats') setStep('basic')
    else if (step === 'style') setStep('stats')
    else if (step === 'confirm') setStep('style')
  }

  const handleSubmit = () => {
    setLoading(true)
    // Encode data for the analysis page (in real app, this would be a database ID)
    const params = new URLSearchParams({
      id: formData.id,
      name: formData.name,
      pos: formData.position,
      club: formData.club,
      photo: formData.photoUrl,
      nation: formData.nationality,
      league: formData.league
    })
    router.push(`/analysis?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00ff88]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Progress Stepper */}
        <div className="flex items-center justify-between mb-12 px-4">
          {[
            { id: 'basic', label: 'Profile', icon: User },
            { id: 'stats', label: 'Metrics', icon: Target },
            { id: 'style', label: 'Style', icon: Zap },
            { id: 'confirm', label: 'Finalize', icon: CheckCircle2 }
          ].map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2">
                <div 
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
                    step === s.id 
                    ? 'bg-[#00ff88] border-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.4)]' 
                    : 'bg-black/40 border-gray-800 text-gray-500'
                  }`}
                >
                  <s.icon className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${step === s.id ? 'text-[#00ff88]' : 'text-gray-600'}`}>
                  {s.label}
                </span>
              </div>
              {i < 3 && (
                <div className="flex-1 h-px bg-gray-800 mx-4 mt-[-20px]" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-black/60 backdrop-blur-2xl border-2 border-gray-800/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Profile */}
            {step === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#00ff88]">
                    Player Identity
                  </h2>
                  <p className="text-gray-400 text-sm">Search for an existing player or enter details manually.</p>
                </div>

                <div className="grid gap-6">
                  <div className="relative">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">
                      Search Database
                    </Label>
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-[#00ff88] transition-colors" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type name (e.g. Lewandowski, Mbappe...)"
                        className="h-14 pl-12 bg-black/40 border-gray-800 focus:border-[#00ff88]/50 focus:ring-0 rounded-2xl transition-all"
                      />
                      {isSearching && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-[#00ff88]/30 border-t-[#00ff88] rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {searchResults.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-50 left-0 right-0 mt-2 bg-[#0d140d] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl max-h-64 overflow-y-auto"
                        >
                          {searchResults.map((p) => (
                            <button
                              key={p.playerID}
                              onClick={() => selectPlayer(p)}
                              className="w-full flex items-center gap-4 p-4 hover:bg-[#00ff88]/5 transition-colors border-b border-gray-800/50 last:border-0"
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-700 relative">
                                <Image src={p.playerPhoto || ''} alt={p.fullName} fill className="object-cover" />
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-sm">{p.fullName}</div>
                                <div className="text-[10px] text-gray-500 uppercase">{p.teamName} • {p.position}</div>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-gray-800" />
                    <span className="text-[8px] font-black uppercase text-gray-700 tracking-[0.4em]">OR</span>
                    <div className="flex-1 h-px bg-gray-800" />
                  </div>

                  <div className="relative">
                     <input 
                       type="file" 
                       id="csv-upload" 
                       className="hidden" 
                       accept=".csv"
                       onChange={(e) => {
                         const file = e.target.files?.[0]
                         if (file) {
                           const reader = new FileReader()
                           reader.onload = (event) => {
                             const text = event.target?.result as string
                             const lines = text.split('\n')
                             if (lines.length > 1) {
                               const data = lines[1].split(',')
                               setFormData(prev => ({
                                 ...prev,
                                 name: data[0] || prev.name,
                                 club: data[1] || prev.club,
                                 age: data[2] || prev.age,
                                 position: data[3] || prev.position,
                                 nationality: data[4] || prev.nationality
                               }))
                               setStep('stats')
                             }
                           }
                           reader.readAsText(file)
                         }
                       }}
                     />
                     <Button 
                       variant="outline" 
                       onClick={() => document.getElementById('csv-upload')?.click()}
                       className="w-full h-16 border-dashed border-gray-800 bg-white/5 rounded-2xl hover:bg-[#00ff88]/5 hover:border-[#00ff88]/30 transition-all group"
                     >
                        <FileUp className="w-5 h-5 mr-3 text-gray-500 group-hover:text-[#00ff88]" />
                        <div className="text-left">
                           <div className="text-xs font-bold text-white uppercase tracking-widest">Import Scout Report (CSV)</div>
                           <div className="text-[10px] text-gray-600 font-medium">Batch import player bio & core metadata</div>
                        </div>
                     </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Full Name</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="h-12 bg-black/40 border-gray-800 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Current Club</Label>
                      <Input 
                        value={formData.club} 
                        onChange={e => setFormData({...formData, club: e.target.value})}
                        className="h-12 bg-black/40 border-gray-800 rounded-xl" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Age</Label>
                      <Input 
                        type="number" 
                        value={formData.age} 
                        onChange={e => setFormData({...formData, age: e.target.value})}
                        className="h-12 bg-black/40 border-gray-800 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Position</Label>
                      <Select 
                        value={formData.position} 
                        onValueChange={v => setFormData({...formData, position: v})}
                      >
                        <SelectTrigger className="h-12 bg-black/40 border-gray-800 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['GK', 'CB', 'LB', 'RB', 'CM', 'CDM', 'CAM', 'LW', 'RW', 'ST'].map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">Nationality</Label>
                      <Input 
                        value={formData.nationality} 
                        onChange={e => setFormData({...formData, nationality: e.target.value})}
                        className="h-12 bg-black/40 border-gray-800 rounded-xl" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleNext}
                    disabled={!formData.name}
                    className="h-14 px-8 bg-[#00ff88] hover:bg-[#00cc6a] text-black font-black uppercase italic rounded-2xl transition-all hover:scale-105 active:scale-95"
                  >
                    Next Step <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Stats */}
            {step === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#00ff88]">
                    Performance Metrics
                  </h2>
                  <p className="text-gray-400 text-sm">Define the player's core attributes (0-100 scale).</p>
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                  {/* Offensive */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[#00ff88]">
                      <Target className="h-5 w-5" />
                      <h3 className="font-bold uppercase tracking-widest text-sm">Offensive</h3>
                    </div>
                    {Object.entries(formData.stats.offensive).map(([key, val]) => (
                      <div key={key} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">{key}</Label>
                          <span className="text-xs font-mono text-[#00ff88]">{val}</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={val} 
                          onChange={e => updateStat('offensive', key, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#00ff88]"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Defensive */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Shield className="h-5 w-5" />
                      <h3 className="font-bold uppercase tracking-widest text-sm">Defensive</h3>
                    </div>
                    {Object.entries(formData.stats.defensive).map(([key, val]) => (
                      <div key={key} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">{key}</Label>
                          <span className="text-xs font-mono text-blue-400">{val}</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={val} 
                          onChange={e => updateStat('defensive', key, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 flex justify-between">
                  <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    className="h-14 px-8 text-gray-500 hover:text-white uppercase font-bold tracking-widest"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="h-14 px-8 bg-[#00ff88] hover:bg-[#00cc6a] text-black font-black uppercase italic rounded-2xl transition-all hover:scale-105"
                  >
                    Next Step <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Style */}
            {step === 'style' && (
              <motion.div
                key="style"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#00ff88]">
                    Play Style & Tactical DNA
                  </h2>
                  <p className="text-gray-400 text-sm">Refine physical and tactical tendencies.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                  {/* Physical */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-orange-400">
                      <Activity className="h-5 w-5" />
                      <h3 className="font-bold uppercase tracking-widest text-sm">Physical</h3>
                    </div>
                    {Object.entries(formData.stats.physical).map(([key, val]) => (
                      <div key={key} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">{key}</Label>
                          <span className="text-xs font-mono text-orange-400">{val}</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={val} 
                          onChange={e => updateStat('physical', key, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Tactical */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Zap className="h-5 w-5" />
                      <h3 className="font-bold uppercase tracking-widest text-sm">Tactical</h3>
                    </div>
                    {Object.entries(formData.stats.tactical).map(([key, val]) => (
                      <div key={key} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-[10px] font-bold uppercase text-gray-500">{key}</Label>
                          <span className="text-xs font-mono text-purple-400">{val}</span>
                        </div>
                        <input 
                          type="range" min="0" max="100" value={val} 
                          onChange={e => updateStat('tactical', key, parseInt(e.target.value))}
                          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 flex justify-between">
                  <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    className="h-14 px-8 text-gray-500 hover:text-white uppercase font-bold tracking-widest"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" /> Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="h-14 px-8 bg-[#00ff88] hover:bg-[#00cc6a] text-black font-black uppercase italic rounded-2xl transition-all hover:scale-105"
                  >
                    Review Profile <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Confirm */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8 text-center"
              >
                <div className="w-24 h-24 bg-[#00ff88]/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-[#00ff88]/30">
                  <Activity className="h-12 w-12 text-[#00ff88] animate-pulse" />
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                    Ready to Deploy
                  </h2>
                  <p className="text-gray-400 max-w-md mx-auto">
                    The engine will now calculate the compatibility score for <span className="text-[#00ff88] font-bold">{formData.name}</span> across all 96 clubs in the Top 5 European leagues.
                  </p>
                </div>

                <div className="bg-white/5 rounded-3xl p-8 border border-white/10 max-w-sm mx-auto space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 uppercase font-bold tracking-widest text-[10px]">Analytic Target</span>
                    <span className="font-bold">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 uppercase font-bold tracking-widest text-[10px]">Position</span>
                    <span className="font-bold">{formData.position}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 uppercase font-bold tracking-widest text-[10px]">Benchmark</span>
                    <span className="font-bold text-[#00ff88]">Top 5 Euro Leagues</span>
                  </div>
                </div>

                <div className="pt-8 flex flex-col gap-4 max-w-sm mx-auto">
                  <Button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="h-16 w-full bg-[#00ff88] hover:bg-[#00cc6a] text-black font-black uppercase italic rounded-2xl transition-all shadow-[0_0_30px_rgba(0,255,136,0.3)]"
                  >
                    {loading ? 'Processing Neural Link...' : 'Execute Full Analysis'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    className="h-12 text-gray-500 hover:text-white uppercase font-bold tracking-widest"
                  >
                    Adjust Details
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
