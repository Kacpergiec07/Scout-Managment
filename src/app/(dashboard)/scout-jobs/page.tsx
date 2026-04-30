import { Metadata } from 'next'
import { ScoutJobsClient } from '@/components/scout-jobs/scout-jobs-client'

export const metadata: Metadata = {
  title: 'Scout Jobs | ScoutPro',
  description: 'Work with elite clubs and provide the best talent suggestions.',
}

export default function ScoutJobsPage() {
  return <ScoutJobsClient />
}
