import { Sidebar } from '@/components/sidebar'
import { ScoutBot } from '@/components/scout/scout-bot'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh bg-background text-foreground transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <ScoutBot />
    </div>
  )
}
