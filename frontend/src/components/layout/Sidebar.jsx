import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Code2, Swords, Map, Trophy,
  Bot, Shield, Bell, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react'
import { toggleSidebar } from '../../store/slices/uiSlice'
import { logout } from '../../store/slices/authSlice'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/challenges', icon: Code2, label: 'Challenges' },
  { path: '/battles', icon: Swords, label: 'Battles' },
  { path: '/roadmaps', icon: Map, label: 'Roadmaps' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { path: '/ai-mentor', icon: Bot, label: 'AI Mentor' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
]

const adminItems = [
  { path: '/admin', icon: Shield, label: 'Admin Panel' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const { sidebarOpen } = useSelector((s) => s.ui)
  const { user } = useSelector((s) => s.auth)
  const isAdmin = user?.role === 'admin'

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 72 }}
      className="fixed left-0 top-0 h-screen bg-surface border-r border-border z-40 flex flex-col"
    >
      <div className="flex items-center gap-3 p-4 border-b border-border">
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">CA</div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">CodeArena</span>
          </motion.div>
        )}
        <button onClick={() => dispatch(toggleSidebar())} className="ml-auto p-1.5 rounded-lg hover:bg-surface-light transition-colors">
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-light'
              }`
            }
          >
            <Icon size={20} />
            {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="my-3 border-t border-border" />
            {adminItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-accent/10 text-accent' : 'text-gray-400 hover:text-gray-200 hover:bg-surface-light'
                  }`
                }
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-border">
        {user && sidebarOpen && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.username}</p>
              <p className="text-xs text-gray-500">Level {user.level}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => dispatch(logout())}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 w-full transition-colors"
        >
          <LogOut size={20} />
          {sidebarOpen && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  )
}
