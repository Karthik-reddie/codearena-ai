import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, Sparkles, BookOpen, Brain, Loader2 } from 'lucide-react'
import { aiAPI } from '../services/api'

export default function AIMentor() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey! I'm your AI coding mentor. Ask me anything about DSA, algorithms, code explanations, or let me generate a quiz for you!" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState('beginner')
  const [tab, setTab] = useState('chat')
  const messagesEnd = useRef(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await aiAPI.chat({ message: input, level, history: messages.slice(-10) })
      setMessages((m) => [...m, { role: 'assistant', content: res.data.response }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, AI mentor is not available right now. Please configure OPENAI_API_KEY.' }])
    }
    setLoading(false)
  }

  const generateQuiz = async (topic) => {
    setLoading(true)
    try {
      const res = await aiAPI.generateQuiz({ topic, difficulty: 'medium', num_questions: 5 })
      const quiz = res.data
      let quizText = `**Quiz: ${quiz.topic}** (${quiz.difficulty})\n\n`
      quiz.questions?.forEach((q, i) => {
        quizText += `**${i + 1}. ${q.question}**\n`
        q.options?.forEach((opt) => { quizText += `  ${opt}\n` })
        quizText += `\n_Answer: Option ${q.correct_answer + 1}_\n_${q.explanation}_\n\n`
      })
      setMessages((m) => [...m, { role: 'assistant', content: quizText || 'Quiz generation requires OPENAI_API_KEY configuration.' }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Quiz generation requires OPENAI_API_KEY configuration.' }])
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bot className="text-primary" /> AI Coding Mentor</h1>
          <p className="text-gray-400 mt-1">Get personalized help, explanations, and quizzes</p>
        </div>
        <select className="input-field w-40" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <div className="flex gap-2">
        {[
          { id: 'chat', icon: Bot, label: 'Chat' },
          { id: 'quiz', icon: Brain, label: 'Quiz' },
          { id: 'explain', icon: BookOpen, label: 'Explain' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? 'bg-primary text-white' : 'bg-surface-light text-gray-400 hover:text-white'}`}>
            <Icon size={16} />{label}
          </button>
        ))}
      </div>

      {tab === 'quiz' && (
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Sparkles size={18} className="text-warning" /> Quick Quiz Topics</h3>
          <div className="flex flex-wrap gap-2">
            {['Arrays', 'Linked Lists', 'Trees', 'Dynamic Programming', 'Graphs', 'Sorting', 'Recursion', 'Hash Tables'].map((topic) => (
              <button key={topic} onClick={() => generateQuiz(topic)} className="px-3 py-1.5 rounded-lg bg-surface-light hover:bg-primary/10 hover:text-primary text-sm transition-colors">
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 card overflow-y-auto flex flex-col min-h-0">
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === 'user' ? 'bg-primary text-white rounded-br-sm' : 'bg-surface-light text-gray-200 rounded-bl-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-light px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-sm text-gray-400">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        <div className="flex gap-2 pt-4 border-t border-border">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="Ask me anything about coding..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} disabled={loading} className="btn-primary px-4">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
