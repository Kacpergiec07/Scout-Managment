import { SidebarWrapper } from '@/components/sidebar-wrapper'
import { ScoutBot } from '@/components/scout/scout-bot'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-svh w-screen bg-[#050505] text-white overflow-hidden font-sans">
      <SidebarWrapper />
      <main className="flex-1 w-full h-full relative overflow-y-auto">
        {children}
      </main>
      <ScoutBot />
    </div>
  )
}
