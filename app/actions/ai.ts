'use server'

import { anthropic } from '@ai-sdk/anthropic'
import { generateText, streamText } from 'ai'
import { ScoutProPlayer } from '@/lib/types/player'
import { ClubContext, CompatibilityResult } from '@/lib/engine/scoring'

export async function generateScoutNarrative(
  player: ScoutProPlayer,
  club: ClubContext,
  analysis: CompatibilityResult
) {
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

  const result = await streamText({
    model: anthropic('claude-3-5-sonnet-20240620'),
    prompt: prompt,
  })

  return result.fullStream
}
