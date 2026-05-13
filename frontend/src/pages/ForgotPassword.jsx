import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import { authAPI } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await authAPI.forgotPassword(email)
    } catch { /* ignore */ }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-dark p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">CA</div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
        </div>

        <div className="glass p-8">
          {sent ? (
            <div className="text-center">
              <p className="text-green-400 mb-4">If the email exists, a reset link has been sent.</p>
              <Link to="/login" className="text-primary hover:underline">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" placeholder="Enter your email" className="input-field pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary w-full">Send Reset Link</button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-primary flex items-center justify-center gap-1">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
