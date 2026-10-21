import React, { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bot, User } from 'lucide-react'
import type { ChatMessage, Expression, AnimationType } from '../types'
import { api } from '../services/api'

interface ChatViewProps {
  onCompanionReply: (reply: { text: string; expression: Expression; animation: AnimationType }) => void
}

export const ChatView: React.FC<ChatViewProps> = ({ onCompanionReply }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hi there! I'm Sparky! How's your day going? You can ask me anything or tell me how you feel!",
      expression: 'happy',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [input, setInput] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const quickSuggestions = [
    'Tell me a fun joke! 😄',
    'How does quantum computing work?',
    'Help me plan my day 📅',
    'Give me some motivation 💪',
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await api.sendChatMessage(text)
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: reply.text,
        expression: reply.expression,
        animation: reply.animation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, assistantMsg])
      onCompanionReply({
        text: reply.text,
        expression: reply.expression,
        animation: reply.animation,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-md ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-orange-500 text-slate-950 font-bold'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-md ${
                m.sender === 'user'
                  ? 'bg-blue-600/90 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {m.sender === 'assistant' && m.expression && (
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-orange-400 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span className="capitalize">{m.expression}</span>
                </div>
              )}
              <p>{m.text}</p>
              <div
                className={`text-[9px] mt-1 text-right ${
                  m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-orange-400 p-2 animate-pulse">
            <Bot className="w-4 h-4" />
            <span>Sparky is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-slate-800/60 bg-slate-900/40">
        {quickSuggestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/60 active:scale-95 transition-all cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Talk to Sparky..."
          className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-orange-500/80 transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold active:scale-95 transition-all shadow-md cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
