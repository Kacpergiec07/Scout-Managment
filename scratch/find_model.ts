import { generateText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function test() {
  const zhipu = createOpenAI({
    apiKey: process.env.ZAI_API_KEY || '2e2622ecf47d4f329985d301b2f7a3c9.qUQD8hjcBP9LIJEt',
    baseURL: process.env.ZAI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/',
  })

  const models = ['glm-4-flash', 'glm-4-plus', 'glm-4-0520', 'glm-4-air', 'glm-4.7'];
  
  for (const model of models) {
    try {
      console.log(`Testing model: ${model}...`);
      const { text } = await generateText({
        model: zhipu.chat(model),
        prompt: 'Hello',
      });
      console.log(`Model ${model} worked! Response: ${text}`);
      return; // Stop if one works
    } catch (e: any) {
      console.log(`Model ${model} failed: ${e.message}`);
    }
  }
}
test();
