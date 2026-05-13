import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code2, Bot, Swords, Trophy, Map, Zap, ArrowRight } from 'lucide-react'

const features = [
  { icon: Code2, title: 'Coding Challenges', desc: 'Solve 100+ problems across all difficulty levels with real-time test execution', color: 'text-primary' },
  { icon: Bot, title: 'AI Coding Mentor', desc: 'Get personalized explanations, hints, and adaptive quizzes powered by GPT-4', color: 'text-success' },
  { icon: Swords, title: 'Multiplayer Battles', desc: 'Challenge other coders in real-time competitive coding battles', color: 'text-accent' },
  { icon: Map, title: 'Learning Roadmaps', desc: 'Follow structured paths for DSA, Frontend, Backend, and AI/ML', color: 'text-warning' },
  { icon: Trophy, title: 'Leaderboards & XP', desc: 'Earn XP, level up, and compete for the top spot on global rankings', color: 'text-xp' },
  { icon: Zap, title: 'Smart Analytics', desc: 'Track your progress with heatmaps, streaks, and skill breakdowns', color: 'text-primary-light' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-dark">
      <header className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">CA</div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CodeArena AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
            <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Level Up Your
            <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent"> Coding Skills</span>
          </h1>
          <p className="text-xl text-gray-400 mt-6 max-w-2xl mx-auto">
            A gamified platform to master DSA and development through AI-powered challenges, multiplayer battles, and personalized learning paths.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link to="/signup" className="btn-primary text-lg py-3 px-8 flex items-center gap-2">
              Start Learning Free <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="btn-secondary text-lg py-3 px-8">Demo Login</Link>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Master Coding</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card group hover:scale-[1.02] transition-transform">
              <Icon size={32} className={`${color} mb-4`} />
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/50 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-gray-400 mb-8">Join thousands of developers improving their skills every day.</p>
          <Link to="/signup" className="btn-primary text-lg py-3 px-8">Create Free Account</Link>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          &copy; 2025 CodeArena AI. Built for developers, by developers.
        </div>
      </footer>
    </div>
  )
}
