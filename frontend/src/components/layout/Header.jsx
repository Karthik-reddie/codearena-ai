import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Bell, Flame, Star } from 'lucide-react'

export default function Header() {
  const { user } = useSelector((s) => s.auth)
  const { unreadCount } = useSelector((s) => s.ui)

  if (!user) return null

  return (
    <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xp">
          <Star size={18} fill="currentColor" />
          <span className="font-bold">{user.xp} XP</span>
        </div>
        <div className="flex items-center gap-2 text-accent">
          <Flame size={18} />
          <span className="font-medium">{user.streak_days} day streak</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          Level {user.level}
        </div>
        <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-surface-light transition-colors">
          <Bell size={20} className="text-gray-400" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
            {user.username[0].toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  )
}
