import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { signup, clearError } from '../store/slices/authSlice'

export default function Signup() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ username: '', email: '', password: '', full_name: '' })
  const [showPass, setShowPass] = useState(false)

  if (user) return <Navigate to="/dashboard" />

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(signup(form))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dark p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">CA</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Join CodeArena</h1>
          <p className="text-gray-400 mt-2">Start your coding journey today</p>
        </div>

        <div className="glass p-8">
          <h2 className="text-xl font-semibold mb-6">Create your account</h2>
          {error && <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm" onClick={() => dispatch(clearError())}>{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Full name" className="input-field pl-10" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            </div>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Username" className="input-field pl-10" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} />
            </div>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="email" placeholder="Email address" className="input-field pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type={showPass ? 'text' : 'password'} placeholder="Password (min 8 chars)" className="input-field pl-10 pr-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
