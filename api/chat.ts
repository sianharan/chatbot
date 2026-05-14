import type { VercelRequest, VercelResponse } from '@vercel/node'
import { SYSTEM_PROMPT } from './prompts'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatRequestBody = {
  messages?: ChatMessage[]
}

type OpenAIResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
  error?: {
    message?: string
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY가 설정되지 않았습니다.' })
  }

  const body = (req.body ?? {}) as ChatRequestBody
  const messages = body.messages

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages 배열이 필요합니다.' })
  }

  try {
    const upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    })

    const data = (await upstream.json()) as OpenAIResponse

    if (!upstream.ok) {
      const message = data.error?.message ?? 'OpenAI API 호출에 실패했습니다.'
      return res.status(upstream.status).json({ error: message })
    }

    const reply = data.choices?.[0]?.message?.content ?? ''
    return res.status(200).json({ reply })
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return res.status(500).json({ error: message })
  }
}
