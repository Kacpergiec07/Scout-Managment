'use server'

import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'

export async function getPlayerScoutingHintsAction(
  players: { id: string; name: string; team: string; position: string }[],
  targetContext: { position: string; requirements: string[] }
) {
  if (!players.length) return {}

  const zai = createOpenAI({
    apiKey: process.env.ZAI_API_KEY,
    baseURL: process.env.ZAI_BASE_URL,
  })

  const playersList = players.map(p => `- ${p.name} (${p.position}, ${p.team})`).join('\n')
  const reqsList = targetContext.requirements.join(', ')

  const prompt = `
    You are an elite football scouting assistant. I have a list of players found in a search.
    The club is looking for a ${targetContext.position}.
    Requirements: ${reqsList}

    Players found:
    ${playersList}

    For EACH player, provide a very brief (max 10 words) scouting "AI Tip" in Polish explaining if they fit the profile or what to watch out for.
    Be objective and professional.

    Return ONLY a JSON object where keys are player names (exactly as provided) and values are the tips.
    Example:
    {
      "Robert Lewandowski": "Idealny snajper, ale wysoka pensja i wiek.",
      "Lamine Yamal": "Ogromny talent, idealny na skrzydło, kreatywność."
    }
  `

  try {
    const result = await generateText({
      model: zai.chat(process.env.ZAI_MODEL || 'glm-4.7'),
      prompt: prompt,
      temperature: 0.7,
    })

    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const hints = JSON.parse(jsonMatch[0])
      // Map names back to IDs
      const idHints: Record<string, string> = {}
      players.forEach(p => {
        if (hints[p.name]) {
          idHints[p.id] = hints[p.name]
        }
      })
      return idHints
    }
  } catch (error) {
    console.error('Error generating scouting hints:', error)
  }

  return {}
}
