import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Search, Filter, ChevronRight } from 'lucide-react'
import { fetchChallenges } from '../store/slices/challengeSlice'

const difficultyColors = {
  easy: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  hard: 'bg-error/10 text-error',
}

export default function Challenges() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector((s) => s.challenges)
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => {
    dispatch(fetchChallenges({ search, difficulty: difficulty || undefined }))
  }, [dispatch, search, difficulty])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Code2 className="text-primary" /> Coding Challenges</h1>
          <p className="text-gray-400 mt-1">Practice and improve your problem-solving skills</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search challenges..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="relative">
          <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select className="input-field pl-10 pr-8 appearance-none cursor-pointer" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map((challenge, i) => (
            <motion.div key={challenge.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/challenges/${challenge.slug}`} className="card flex items-center justify-between group hover:border-primary/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {challenge.id}
                  </div>
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">{challenge.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[challenge.difficulty]}`}>
                        {challenge.difficulty}
                      </span>
                      {challenge.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-surface-light text-gray-400">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-xp font-medium">+{challenge.xp_reward} XP</span>
                  <ChevronRight size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </motion.div>
          ))}
          {list.length === 0 && <p className="text-center text-gray-500 py-12">No challenges found</p>}
        </div>
      )}
    </div>
  )
}
