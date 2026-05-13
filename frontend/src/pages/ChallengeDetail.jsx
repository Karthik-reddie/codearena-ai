import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Editor from '@monaco-editor/react'
import { Play, RotateCcw, Clock, Lightbulb, CheckCircle2, XCircle } from 'lucide-react'
import { fetchChallenge, submitSolution, clearSubmission } from '../store/slices/challengeSlice'

export default function ChallengeDetail() {
  const { slug } = useParams()
  const dispatch = useDispatch()
  const { current: challenge, submission, loading } = useSelector((s) => s.challenges)
  const [code, setCode] = useState('')
  const [language] = useState('python')
  const [showHints, setShowHints] = useState(false)
  const [timer, setTimer] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    dispatch(fetchChallenge(slug))
    dispatch(clearSubmission())
  }, [dispatch, slug])

  useEffect(() => {
    if (challenge?.starter_code?.[language]) {
      setCode(challenge.starter_code[language])
    }
  }, [challenge, language])

  useEffect(() => {
    if (!running) return
    const interval = setInterval(() => setTimer((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [running])

  useEffect(() => { setRunning(true) }, [])

  const handleSubmit = () => {
    if (!challenge) return
    dispatch(submitSolution({ challenge_id: challenge.id, code, language }))
  }

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  if (loading || !challenge) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
  }

  const diffColor = { easy: 'text-success', medium: 'text-warning', hard: 'text-error' }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
      <div className="overflow-y-auto space-y-4 pr-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${diffColor[challenge.difficulty]} bg-current/10`}>
              {challenge.difficulty}
            </span>
            <span className="text-sm text-xp font-medium">+{challenge.xp_reward} XP</span>
          </div>
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
        </div>

        <div className="card">
          <div className="prose prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
            {challenge.description}
          </div>
        </div>

        {challenge.constraints && (
          <div className="card">
            <h3 className="font-semibold mb-2 text-sm text-gray-400">Constraints</h3>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{challenge.constraints}</pre>
          </div>
        )}

        {challenge.examples?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-3 text-sm text-gray-400">Examples</h3>
            {challenge.examples.map((ex, i) => (
              <div key={i} className="mb-3 p-3 rounded-lg bg-surface-dark text-sm">
                <div><span className="text-gray-500">Input:</span> <code>{ex.input}</code></div>
                <div><span className="text-gray-500">Output:</span> <code>{ex.output}</code></div>
                {ex.explanation && <div className="mt-1 text-gray-500 text-xs">{ex.explanation}</div>}
              </div>
            ))}
          </div>
        )}

        {challenge.hints?.length > 0 && (
          <div className="card">
            <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-2 text-sm font-medium text-warning">
              <Lightbulb size={16} /> {showHints ? 'Hide' : 'Show'} Hints ({challenge.hints.length})
            </button>
            {showHints && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-3 space-y-2">
                {challenge.hints.map((hint, i) => (
                  <p key={i} className="text-sm text-gray-400 pl-4 border-l-2 border-warning/30">{hint}</p>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-gray-500" />
            <span className="text-sm font-mono text-gray-400">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCode(challenge.starter_code?.[language] || '')} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
              <RotateCcw size={14} /> Reset
            </button>
            <button onClick={handleSubmit} className="btn-primary text-sm py-1.5 px-4 flex items-center gap-1">
              <Play size={14} /> Submit
            </button>
          </div>
        </div>

        <div className="flex-1 rounded-xl overflow-hidden border border-border">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(v) => setCode(v || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              roundedSelection: true,
              automaticLayout: true,
            }}
          />
        </div>

        {submission && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`card border ${submission.status === 'accepted' ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'}`}>
            <div className="flex items-center gap-2 mb-2">
              {submission.status === 'accepted'
                ? <><CheckCircle2 size={20} className="text-success" /><span className="font-semibold text-success">Accepted!</span><span className="text-sm text-xp">+{submission.xp_earned} XP</span></>
                : <><XCircle size={20} className="text-error" /><span className="font-semibold text-error">Wrong Answer</span></>
              }
            </div>
            {submission.test_results?.results && (
              <div className="space-y-1 text-sm">
                {submission.test_results.results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {r.passed ? <CheckCircle2 size={14} className="text-success" /> : <XCircle size={14} className="text-error" />}
                    <span className="text-gray-400">Test {r.test_case}</span>
                    {r.error && <span className="text-error text-xs">{r.error}</span>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
