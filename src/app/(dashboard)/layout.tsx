import { SidebarWrapper } from '@/components/sidebar-wrapper'
import { ScoutBot } from '@/components/scout/scout-bot'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-svh w-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
      <SidebarWrapper />
      <main className="flex-1 w-full h-full relative overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
