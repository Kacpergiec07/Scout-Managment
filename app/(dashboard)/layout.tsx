<<<<<<< HEAD
import { Sidebar } from '@/components/sidebar'
import { ScoutBot } from '@/components/scout/scout-bot'
import { Toaster } from '@/components/ui/toaster'
=======
import { SidebarWrapper } from '@/components/sidebar-wrapper'
>>>>>>> 0fced7fac57a646d79d15a5adebe45adaee32fbd

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
<<<<<<< HEAD
    <div className="flex min-h-svh bg-background text-foreground transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <ScoutBot />
=======
    <div className="flex h-svh w-screen bg-[#050505] text-white overflow-hidden font-sans">
      <SidebarWrapper />
      <main className="flex-1 w-full h-full relative overflow-y-auto">
        {children}
      </main>
>>>>>>> 0fced7fac57a646d79d15a5adebe45adaee32fbd
    </div>
  )
}
