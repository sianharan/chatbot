import { useEffect, useRef, useState } from 'react'
import { sendChat, type ChatMessage } from '../api/chat'

const INITIAL_GREETING: ChatMessage = {
  role: 'assistant',
  content:
    '안녕하세요! 영어 단어 퀴즈 챗봇입니다. 📚\n어떤 주제와 난이도(예: "여행, 초급" / "비즈니스, 중급")를 원하시나요?',
}

function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const trimmed = input.trim()
    if (!trimmed || loading) return

    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const reply = await sendChat(next)
      setMessages([...next, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chatbot">
      <header className="chatbot-header">
        <h1>영어 단어 퀴즈 챗봇</h1>
        <p>주제와 난이도를 알려주시면 단어와 복습 퀴즈를 드려요.</p>
      </header>

      <div className="chat-log" ref={logRef}>
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            <div className="bubble-role">{m.role === 'user' ? '나' : '챗봇'}</div>
            <div className="bubble-content">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="bubble assistant">
            <div className="bubble-role">챗봇</div>
            <div className="bubble-content">답변을 생성하고 있어요...</div>
          </div>
        )}
        {error && <div className="chat-error">⚠ {error}</div>}
      </div>

      <div className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='주제와 난이도를 입력하세요 (예: "여행, 초급")'
          rows={2}
          disabled={loading}
        />
        <button type="button" onClick={handleSend} disabled={loading || !input.trim()}>
          전송
        </button>
      </div>
    </div>
  )
}

export default Chatbot
