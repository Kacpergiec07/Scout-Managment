'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReactMarkdown from 'react-markdown'
import { Sparkles } from 'lucide-react'
import { readStreamableValue } from '@ai-sdk/rsc'

interface AiNarrativeProps {
  stream?: any // fullStream from server action
}

export function AiNarrative({ stream }: AiNarrativeProps) {
  const [content, setContent] = React.useState('')

  React.useEffect(() => {
    async function update() {
      if (!stream) return
      for await (const delta of readStreamableValue(stream)) {
        if (typeof delta === 'string') {
          setContent((prev) => prev + delta)
        }
      }
    }
    update()
  }, [stream])

  return (
    <Card className="bg-zinc-900 border-zinc-800 border-emerald-500/30">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Sparkles className="h-5 w-5 text-emerald-500" />
        <CardTitle className="text-lg font-bold text-zinc-50">AI Scout Insights</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed">
        {content ? (
          <ReactMarkdown>{content}</ReactMarkdown>
        ) : (
          <div className="space-y-2 py-2">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-zinc-800" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
