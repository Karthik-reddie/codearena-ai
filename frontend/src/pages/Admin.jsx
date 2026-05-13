import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Code2, Swords, FileText, Search, Ban, CheckCircle2 } from 'lucide-react'
import { adminAPI } from '../services/api'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    adminAPI.getStats().then((r) => setStats(r.data)).catch(() => {})
    adminAPI.getUsers({}).then((r) => setUsers(r.data)).catch(() => {})
  }, [])

  const searchUsers = () => {
    adminAPI.getUsers({ search }).then((r) => setUsers(r.data)).catch(() => {})
  }

  const toggleActive = async (id) => {
    const res = await adminAPI.toggleUserActive(id)
    setUsers((u) => u.map((x) => (x.id === id ? { ...x, is_active: res.data.is_active } : x)))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="text-accent" /> Admin Panel</h1>
        <p className="text-gray-400 mt-1">Manage platform content and users</p>
      </div>

      <div className="flex gap-2">
        {['overview', 'users', 'challenges'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-accent text-white' : 'bg-surface-light text-gray-400'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Users', value: stats.total_users, color: 'bg-primary/10 text-primary' },
            { icon: Code2, label: 'Challenges', value: stats.total_challenges, color: 'bg-success/10 text-success' },
            { icon: FileText, label: 'Submissions', value: stats.total_submissions, color: 'bg-warning/10 text-warning' },
            { icon: Swords, label: 'Battles', value: stats.total_battles, color: 'bg-accent/10 text-accent' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={20} /></div>
                <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-gray-400">{label}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search users..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchUsers()} />
            </div>
            <button onClick={searchUsers} className="btn-primary">Search</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-gray-500">
                <th className="text-left py-3 px-2">User</th><th className="text-left py-3">Email</th>
                <th className="text-center py-3">Role</th><th className="text-center py-3">Level</th>
                <th className="text-center py-3">XP</th><th className="text-center py-3">Status</th>
                <th className="text-center py-3">Actions</th>
              </tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/30 hover:bg-surface-light/50">
                    <td className="py-3 px-2 font-medium">{u.username}</td>
                    <td className="py-3 text-gray-400">{u.email}</td>
                    <td className="py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>{u.role}</span></td>
                    <td className="py-3 text-center">{u.level}</td>
                    <td className="py-3 text-center text-xp">{u.xp}</td>
                    <td className="py-3 text-center">{u.is_active ? <CheckCircle2 size={16} className="inline text-success" /> : <Ban size={16} className="inline text-error" />}</td>
                    <td className="py-3 text-center">
                      <button onClick={() => toggleActive(u.id)} className="text-xs px-2 py-1 rounded bg-surface-dark hover:bg-surface-light transition-colors">
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'challenges' && (
        <div className="card">
          <p className="text-gray-400">Challenge management available through the API. Use the challenges page to create and edit problems.</p>
        </div>
      )}
    </div>
  )
}
