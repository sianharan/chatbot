export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  role: ChatRole
  content: string
}

type ChatResponse = {
  reply?: string
  error?: string
}

export async function sendChat(messages: ChatMessage[]): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })

  let data: ChatResponse
  try {
    data = (await res.json()) as ChatResponse
  } catch {
    throw new Error(`서버 응답을 해석할 수 없습니다. (status ${res.status})`)
  }

  if (!res.ok) {
    throw new Error(data.error ?? `요청이 실패했습니다. (status ${res.status})`)
  }

  return data.reply ?? ''
}
