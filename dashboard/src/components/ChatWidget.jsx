import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Loader2 } from 'lucide-react'
import apiClient from '../apiClient'

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your Hostel AI Assistant. Ask me anything about your timetable, menu logic, or roommate matching stats!" }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const userStr = localStorage.getItem('hostel_user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = currentUser ? currentUser.user_id : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    
    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setInput('')
    setIsTyping(true)

    try {
      const res = await apiClient.post('/chat', { user_id: currentUserId, message: userMsg })
      setMessages(prev => [...prev, { role: 'ai', text: res.data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `ERROR: ${err.message}` }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl transition hover:-translate-y-1 group border-4 border-indigo-400"
        >
          <MessageSquare size={32} className="group-hover:animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="bg-white w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
          <div className="bg-slate-900 border-b border-indigo-500/50 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              <div>
                 <h3 className="font-bold tracking-wider text-sm text-indigo-100">Hostel AI Operator</h3>
                 <p className="text-[10px] uppercase text-emerald-400">Context Connected</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition hover:bg-red-500">
              <X size={18} />
            </button>
          </div>

          <div className="h-96 p-4 overflow-y-auto bg-slate-50 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-indigo-600 text-indigo-50 rounded-2xl rounded-br-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-bl-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                    <Loader2 size={16} className="text-indigo-500 animate-spin" />
                    <span className="text-xs font-medium uppercase tracking-widest text-slate-400">Synthesizing...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-1.5 rounded-full focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about roommates or slots..."
                className="flex-1 bg-transparent text-sm px-4 border-none focus:outline-none"
              />
              <button 
                onClick={handleSend}
                disabled={isTyping}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white p-2.5 rounded-full transition shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatWidget
