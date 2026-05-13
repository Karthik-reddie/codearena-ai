import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Check, CheckCheck, Trophy, Swords, Flame, Star, Info } from 'lucide-react'
import { notificationsAPI } from '../services/api'

const typeIcons = {
  achievement: Trophy,
  battle: Swords,
  streak: Flame,
  level_up: Star,
  contest: Trophy,
  system: Info,
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    notificationsAPI.list({ unread_only: filter === 'unread' }).then((r) => setNotifications(r.data)).catch(() => {})
  }, [filter])

  const markAllRead = async () => {
    await notificationsAPI.markAllRead()
    setNotifications((n) => n.map((x) => ({ ...x, is_read: true })))
  }

  const markRead = async (id) => {
    await notificationsAPI.markRead(id)
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, is_read: true } : x)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="text-primary" /> Notifications</h1>
          <p className="text-gray-400 mt-1">Stay updated with your activities</p>
        </div>
        <button onClick={markAllRead} className="btn-secondary text-sm flex items-center gap-2">
          <CheckCheck size={16} /> Mark all read
        </button>
      </div>

      <div className="flex gap-2">
        {['all', 'unread'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-primary text-white' : 'bg-surface-light text-gray-400'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {notifications.length > 0 ? notifications.map((n, i) => {
          const Icon = typeIcons[n.type] || Info
          return (
            <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className={`card flex items-start gap-4 ${!n.is_read ? 'border-primary/30' : 'opacity-70'}`}>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-sm text-gray-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-600 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
              </div>
              {!n.is_read && (
                <button onClick={() => markRead(n.id)} className="text-gray-500 hover:text-primary transition-colors p-1">
                  <Check size={16} />
                </button>
              )}
            </motion.div>
          )
        }) : (
          <div className="text-center py-12 text-gray-500">
            <Bell size={48} className="mx-auto mb-4 opacity-30" />
            <p>No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
