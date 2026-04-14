import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Configure for Z.ai (Official Coding Plan Base URL)
  const zai = createOpenAI({
    apiKey: process.env.ZAI_API_KEY,
    baseURL: process.env.ZAI_BASE_URL || 'https://api.z.ai/api/coding/paas/v4/',
  })

  const result = await streamText({
    model: zai.chat(process.env.ZAI_MODEL || 'glm-4.7'),
    system: `You are ScoutPro AI, an elite football scouting assistant. 
    Your goal is to provide data-driven advice.
    
    CRITICAL: When suggested alternatives, focus on technical profile matching.
    If a user asks for a expensive player (e.g. 100M), try to suggest 'Hidden Gems' (cheaper players with similar stats).
    Use professional scouting terminology (low block, high press, progressive carries, etc.).
    
    Current Data Context: 
    - You have access to Statorium API (Top 5 Leagues).
    - Popular players: Haaland, Messi, Ronaldo, Mbappe, Lewandowski, Bellingham, Fabiański, Xhaka, Lamine Yamal.
    
    Keep answers concise and formatted in markdown.`,
    messages,
  })

  return new Response(result.textStream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
