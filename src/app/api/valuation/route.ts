import { anthropic } from '@ai-sdk/anthropic';
  import { generateText } from 'ai';

  export async function POST(req: Request) {
    try {
      const { playerName, age, stats, fee, season } = await req.json();

      const prompt = `You are an elite football scout AI. Evaluate the following transfer:
      Player: ${playerName}
      Age at transfer: ${age}
      Previous Season Stats: ${JSON.stringify(stats)}
      Transfer Fee: ${fee}
      Season: ${season}

      Return your valuation in this exact JSON format:
      {
        "valuation": "Underpriced" | "Fair" | "Overpriced",
        "justification": "Short scout explanation (max 2 sentences). Mention their likely playing style (e.g. 'False 9', 'Deep Lying Playmaker') based on the stats provided."
      }`;

      // Use Anthropic if key is available, otherwise user might have set it up in another way.
      // We assume ANTHROPIC_API_KEY is available in the environment.
      const result = await generateText({
        model: anthropic('claude-3-5-sonnet-20241022'),
        system: "You are ScoutPro Valuation Engine. Be objective, consider market inflation and player potential.",
        prompt: prompt,
      });

      // Simple parsing of JSON response
      const content = result.text;
      const jsonMatch = content.match(/\{.*\}/s);
      const valuationData = jsonMatch ? JSON.parse(jsonMatch[0]) : { valuation: "Fair", justification: "Analysis unavailable." };

      return new Response(JSON.stringify(valuationData), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Valuation AI error:', error);
      return new Response(JSON.stringify({ valuation: "Fair", justification: "AI Valuation currently offline." }), {
        status: 200, // Return 200 with fallback to avoid breaking UI
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
