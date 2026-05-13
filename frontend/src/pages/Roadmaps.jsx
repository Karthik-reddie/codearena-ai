import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Map, CheckCircle2, Circle } from 'lucide-react'
import { roadmapsAPI } from '../services/api'

export default function Roadmaps() {
  const [roadmaps, setRoadmaps] = useState([])
  const [selected, setSelected] = useState(null)
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    roadmapsAPI.list().then((r) => setRoadmaps(r.data)).catch(() => {})
  }, [])

  const selectRoadmap = async (roadmap) => {
    setSelected(roadmap)
    try {
      const res = await roadmapsAPI.getProgress(roadmap.slug)
      setProgress(res.data)
    } catch {
      setProgress({ completed_topics: [], percentage: 0 })
    }
  }

  const toggleTopic = async (topicId) => {
    if (!selected || !progress) return
    const completed = progress.completed_topics.includes(topicId)
    try {
      const res = await roadmapsAPI.updateProgress(selected.slug, { topic_id: topicId, completed: !completed })
      setProgress((p) => ({ ...p, ...res.data }))
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="text-primary" /> Learning Roadmaps</h1>
        <p className="text-gray-400 mt-1">Follow structured paths to master different domains</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roadmaps.map((rm, i) => (
          <motion.button
            key={rm.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => selectRoadmap(rm)}
            className={`card text-left transition-all ${selected?.id === rm.id ? 'border-primary ring-1 ring-primary/30' : ''}`}
          >
            <div className="text-3xl mb-3">{rm.icon}</div>
            <h3 className="font-semibold">{rm.title}</h3>
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{rm.description}</p>
            <div className="mt-3 text-xs text-gray-500">{rm.total_topics} topics</div>
          </motion.button>
        ))}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selected.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{selected.title}</h2>
                <p className="text-sm text-gray-400">{selected.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold" style={{ color: selected.color }}>{progress?.percentage || 0}%</p>
              <p className="text-xs text-gray-500">completed</p>
            </div>
          </div>

          <div className="h-2 bg-surface-dark rounded-full overflow-hidden mb-6">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress?.percentage || 0}%` }} className="h-full rounded-full" style={{ background: selected.color }} />
          </div>

          <div className="space-y-2">
            {selected.topics?.map((topic) => {
              const done = progress?.completed_topics?.includes(topic.id)
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                    done ? 'bg-success/5 border border-success/20' : 'bg-surface-dark hover:bg-surface-light'
                  }`}
                >
                  {done ? <CheckCircle2 size={20} className="text-success" /> : <Circle size={20} className="text-gray-600" />}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${done ? 'text-success' : ''}`}>{topic.title}</p>
                    {topic.description && <p className="text-xs text-gray-500">{topic.description}</p>}
                  </div>
                  <span className="text-xs text-gray-600">#{topic.order}</span>
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
