'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createStreamableValue } from '@ai-sdk/rsc'
import { ScoutProPlayer } from '@/lib/types/player'
import { ClubContext, CompatibilityResult } from '@/lib/engine/scoring'

export async function generateScoutNarrative(
  player: ScoutProPlayer,
  club: ClubContext,
  analysis: CompatibilityResult
) {
  const zai = createOpenAI({
    apiKey: process.env.ZAI_API_KEY,
    baseURL: process.env.ZAI_BASE_URL || 'https://api.z.ai/api/coding/paas/v4/',
  })

  const prompt = `
    You are a professional football scout. Analyze the compatibility of the following player with the target club.
    
    PLAYER: ${player.name} (${player.position})
    CLUB: ${club.name}
    COMPATIBILITY SCORE: ${analysis.totalScore}/100
    
    BREAKDOWN:
    - Tactical DNA Match: ${analysis.breakdown.tactical}%
    - Positional Need: ${analysis.breakdown.positional}%
    - Benchmarking (Stats): ${analysis.breakdown.stats}%
    - Club Form Influence: ${analysis.breakdown.form}%
    
    Provide a professional 2-3 paragraph justification. Use tactical terminology like "half-spaces", "pressing triggers", "progressive carries", etc. 
    Focus on WHY the player fits or where the risks are.
  `

  const stream = createStreamableValue()

  ;(async () => {
    try {
      const { textStream } = await streamText({
        model: zai.chat(process.env.ZAI_MODEL || 'glm-4.7'),
        prompt: prompt,
      })

      for await (const text of textStream) {
        stream.update(text)
      }

      stream.done()
    } catch (e) {
      console.error(e)
      stream.update("\n\nScoutPro AI Error: Could not generate narrative at this time.")
      stream.done()
    }
  })()

  return { output: stream.value }
}
