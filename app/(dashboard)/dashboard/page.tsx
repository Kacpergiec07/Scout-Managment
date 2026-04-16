import { PlayerSearch } from '@/components/scout/player-search'
import { TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Scouting Dashboard</h1>
        <p className="text-muted-foreground text-lg italic">Welcome back, Chief Scout. 12 new matches analyzed today.</p>
      </div>

      <div className="relative p-10 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-900 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-widest">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            System Online: Statorium API Connected
          </div>
          <h2 className="text-3xl font-bold leading-tight">Begin a New Tactical Player Analysis</h2>
          <p className="text-emerald-50/80 text-lg">Enter a player name to ingest high-fidelity data and calculate squad compatibility scores.</p>
          <div className="max-w-md pt-2">
            <PlayerSearch placeholder="Search 25,000+ professional athletes..." />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard 
          icon={TrendingUp} 
          title="Market Trends" 
          description="View rising stars and undervalued talents in Top 5 leagues." 
          href="/history"
        />
        <DashboardCard 
          icon={Users} 
          title="Compare Talent" 
          description="Side-by-side performance breakdown for final decision making." 
          href="/compare"
        />
      </div>
    </div>
  )
}

function DashboardCard({ icon: Icon, title, description, href }: { icon: any, title: string, description: string, href: string }) {
  return (
    <Link href={href} className="group p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm hover:shadow-md">
      <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Link>
  )
}
