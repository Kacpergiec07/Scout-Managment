'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'

export function SidebarWrapper() {
  const pathname = usePathname()

  // Do not render the sidebar on the dashboard overview page, because it has full width accordion layout
  if (pathname === '/dashboard') {
    return null
  }

  return <Sidebar />
}
