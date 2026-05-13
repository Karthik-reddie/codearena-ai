import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star, Crown } from 'lucide-react'
import { leaderboardAPI } from '../services/api'

export default function Leaderboard() {
  const [tab, setTab] = useState('global')
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const fetch = tab === 'global' ? leaderboardAPI.global : leaderboardAPI.weekly
    fetch({ limit: 50 }).then((r) => setEntries(r.data)).catch(() => {})
  }, [tab])

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-400" />
    if (rank === 2) return <Medal size={20} className="text-gray-300" />
    if (rank === 3) return <Medal size={20} className="text-amber-600" />
    return <span className="text-gray-500 font-mono text-sm w-5 text-center">{rank}</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Trophy className="text-xp" /> Leaderboard</h1>
        <p className="text-gray-400 mt-1">See how you rank against other coders</p>
      </div>

      <div className="flex gap-2">
        {['global', 'weekly'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-primary text-white' : 'bg-surface-light text-gray-400 hover:text-white'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="grid grid-cols-[3rem_1fr_6rem_6rem_6rem] gap-4 pb-3 border-b border-border text-sm text-gray-500 font-medium">
          <span>Rank</span><span>User</span><span className="text-right">XP</span><span className="text-right">Solved</span><span className="text-right">Wins</span>
        </div>
        <div className="divide-y divide-border/50">
          {entries.map((entry, i) => (
            <motion.div key={entry.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={`grid grid-cols-[3rem_1fr_6rem_6rem_6rem] gap-4 py-3 items-center ${entry.rank <= 3 ? 'bg-xp/5 -mx-6 px-6 rounded-lg' : ''}`}>
              <div className="flex justify-center">{getRankIcon(entry.rank)}</div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                  {entry.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{entry.username}</p>
                  <p className="text-xs text-gray-500">Level {entry.level}</p>
                </div>
              </div>
              <div className="text-right flex items-center justify-end gap-1 text-xp font-medium">
                <Star size={14} fill="currentColor" />{entry.xp}
              </div>
              <div className="text-right text-sm text-gray-400">{entry.problems_solved}</div>
              <div className="text-right text-sm text-gray-400">{entry.battles_won}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
