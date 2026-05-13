import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Star, Flame, Trophy, Code2, Swords, Target, TrendingUp, Zap } from 'lucide-react'
import { dashboardAPI } from '../services/api'

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  </motion.div>
)

const HeatmapCell = ({ count }) => {
  const intensity = count === 0 ? 'bg-surface-light' : count < 2 ? 'bg-primary/20' : count < 4 ? 'bg-primary/40' : count < 6 ? 'bg-primary/60' : 'bg-primary'
  return <div className={`w-3 h-3 rounded-sm ${intensity}`} title={`${count} problems`} />
}

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth)
  const [stats, setStats] = useState(null)
  const [goals, setGoals] = useState(null)
  const [heatmap, setHeatmap] = useState([])
  const [recentSubs, setRecentSubs] = useState([])

  useEffect(() => {
    dashboardAPI.getStats().then((r) => setStats(r.data)).catch(() => {})
    dashboardAPI.getDailyGoals().then((r) => setGoals(r.data)).catch(() => {})
    dashboardAPI.getHeatmap().then((r) => setHeatmap(r.data)).catch(() => {})
    dashboardAPI.getRecentSubmissions().then((r) => setRecentSubs(r.data)).catch(() => {})
  }, [])

  const xpProgress = stats ? ((user?.xp || 0) / (stats.xp_to_next_level || 1)) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.full_name || user?.username}!</h1>
          <p className="text-gray-400 mt-1">Keep up the great work. Here&apos;s your progress overview.</p>
        </div>
        <Link to="/challenges" className="btn-primary">Start Coding</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Star} label="Total XP" value={user?.xp || 0} color="bg-xp/10 text-xp" />
        <StatCard icon={Flame} label="Day Streak" value={user?.streak_days || 0} color="bg-accent/10 text-accent" />
        <StatCard icon={Code2} label="Problems Solved" value={user?.problems_solved || 0} color="bg-success/10 text-success" />
        <StatCard icon={Swords} label="Battles Won" value={user?.battles_won || 0} color="bg-primary/10 text-primary" sub={`${user?.battles_played || 0} played`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Level Progress
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
              {user?.level || 1}
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Level {user?.level || 1}</span>
                <span className="text-gray-400">{user?.xp || 0} / {stats?.xp_to_next_level || 100} XP</span>
              </div>
              <div className="h-3 bg-surface-dark rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(xpProgress, 100)}%` }} className="h-full bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target size={20} className="text-accent" /> Daily Goals
          </h3>
          {goals ? (
            <div className="space-y-4">
              <GoalBar label="Problems" current={goals.problems_done} target={goals.problems_goal} />
              <GoalBar label="XP Earned" current={goals.xp_earned} target={goals.xp_goal} />
              <GoalBar label="Time (min)" current={goals.time_spent_minutes} target={goals.time_goal_minutes} />
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Loading goals...</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap size={20} className="text-success" /> Coding Heatmap
          </h3>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 52 * 7 }, (_, i) => {
              const activity = heatmap[i % heatmap.length]
              return <HeatmapCell key={i} count={activity?.problems_solved || 0} />
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <span>Less</span>
            {[0, 1, 3, 5, 7].map((n) => <HeatmapCell key={n} count={n} />)}
            <span>More</span>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-xp" /> Recent Submissions
          </h3>
          {recentSubs.length > 0 ? (
            <div className="space-y-2">
              {recentSubs.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-dark">
                  <div>
                    <span className="text-sm font-medium">Challenge #{sub.challenge_id}</span>
                    <span className="text-xs text-gray-500 ml-2">{sub.language}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    sub.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                  }`}>
                    {sub.status === 'accepted' ? 'Accepted' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No submissions yet. Start solving!</p>
          )}
        </div>
      </div>
    </div>
  )
}

function GoalBar({ label, current, target }) {
  const pct = Math.min((current / target) * 100, 100)
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-gray-500">{current}/{target}</span>
      </div>
      <div className="h-2 bg-surface-dark rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
