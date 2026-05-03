import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react'
import apiClient from '../apiClient'

const SUGGESTIONS = [
  'Who is my best roommate match?',
  'What are my meals today?',
  'When is my next laundry slot?',
  'How is my trust score calculated?',
]

const ChatWidget = () => {
  const [isOpen,    setIsOpen]    = useState(false)
  const [messages,  setMessages]  = useState([
    { role: 'ai', text: "👋 Hi! I'm your Hostel AI Assistant. Ask me about your roommates, schedule, or anything hostel-related!" }
  ])
  const [input,     setInput]     = useState('')
  const [isTyping,  setIsTyping]  = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(scrollToBottom, [messages])

  const handleSend = async (msg) => {
    const text = (msg || input).trim()
    if (!text) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setIsTyping(true)

    try {
      // JWT handles user identity — no need to pass user_id
      const res = await apiClient.post('/chat', { message: text })
      setMessages(prev => [...prev, { role: 'ai', text: res.data.response }])
    } catch (err) {
      const errMsg = err.response?.data?.description || err.message
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Error: ${errMsg}` }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* FAB button */}
      {!isOpen && (
        <div className="chat-fab">
          <button className="chat-bubble pulse-glow" onClick={() => setIsOpen(true)} title="Open AI Assistant">
            <MessageSquare size={24} />
          </button>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
            padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderBottom: '1px solid rgba(99,102,241,.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Bot size={18} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'white' }}>Hostel AI</div>
                <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Context Connected
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,.08)', border: 'none',
                padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
                color: '#94a3b8', transition: 'all .2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,.3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'white',
                  color: m.role === 'user' ? 'white' : '#334155',
                  fontSize: 13,
                  lineHeight: 1.6,
                  boxShadow: '0 2px 8px rgba(0,0,0,.06)',
                  border: m.role === 'ai' ? '1px solid #e2e8f0' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: 'white', border: '1px solid #e2e8f0',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <Loader2 size={14} color="#6366f1" style={{ animation: 'spin 0.7s linear infinite' }} />
                  <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '8px 12px', background: 'white', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i}
                  onClick={() => handleSend(s)}
                  style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                    background: '#eef2ff', color: '#6366f1', border: '1px solid #c7d2fe',
                    cursor: 'pointer', transition: 'all .15s'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px', background: 'white', borderTop: '1px solid #f1f5f9' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 999, padding: '6px 6px 6px 14px',
              transition: 'all .2s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = '#6366f1'}
            onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isTyping && handleSend()}
                placeholder="Ask about roommates or schedule…"
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  outline: 'none', fontSize: 13, color: '#0f172a'
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
                style={{
                  background: input.trim() && !isTyping
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : '#e2e8f0',
                  border: 'none', borderRadius: 999, padding: '7px 10px',
                  cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                  transition: 'all .2s', display: 'flex'
                }}
              >
                <Send size={16} color={input.trim() && !isTyping ? 'white' : '#94a3b8'} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatWidget
