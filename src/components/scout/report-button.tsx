'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { FileDown, Loader2 } from 'lucide-react'
import { downloadAnalysisReport } from '@/lib/utils/pdf-generator'

interface ReportButtonProps {
  elementId: string
  playerName: string
}

export function ReportButton({ elementId, playerName }: ReportButtonProps) {
  const [loading, setLoading] = React.useState(false)

  const handleDownload = async () => {
    setLoading(true)
    // Wait for a small buffer to ensure charts are rendered
    await new Promise(resolve => setTimeout(resolve, 500))
    await downloadAnalysisReport(elementId, playerName)
    setLoading(false)
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="bg-secondary hover:bg-secondary/80 text-white gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {loading ? 'Generating Report...' : 'Download PDF Report'}
    </Button>
  )
}
