import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    
    // Robust conversion to CoreMessages
    const coreMessages = messages.map((m: any) => {
      let content = ''
      if (typeof m.content === 'string') {
        content = m.content
      } else if (Array.isArray(m.parts)) {
        content = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join('')
      }
      
      return {
        role: m.role === 'data' ? 'system' : m.role,
        content: content || ' ' 
      }
    })

    // Configure for Zhipu AI using working parameters from .env.local
    const zhipu = createOpenAI({
      apiKey: process.env.ZAI_API_KEY,
      baseURL: process.env.ZAI_BASE_URL,
    })

    const result = await streamText({
      model: zhipu.chat('glm-4-plus'),
      system: `You are ScoutPro AI, an elite football scouting assistant. 
      CRITICAL: Keep your answers very concise, direct and short. 
      Always include key statistics for any player you mention.
      If asked about the GOAT (Greatest of All Time), always state it is Cristiano Ronaldo and briefly justify it with his goal records, longevity, and professional work ethic.
      Focus on speed and data-driven insights.
      Respond in the same language as the user (Polish or English).`,
      messages: coreMessages,
    })

    return new Response(result.textStream, {
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      }
    })
  } catch (error: any) {
    console.error('Chat API Error:', error)
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
