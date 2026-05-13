import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUser } from './store/slices/authSlice'
import Layout from './components/layout/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Challenges from './pages/Challenges'
import ChallengeDetail from './pages/ChallengeDetail'
import Battles from './pages/Battles'
import Roadmaps from './pages/Roadmaps'
import Leaderboard from './pages/Leaderboard'
import AIMentor from './pages/AIMentor'
import Notifications from './pages/Notifications'
import Admin from './pages/Admin'

function ProtectedRoute({ children }) {
  const { token } = useSelector((s) => s.auth)
  return token ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useSelector((s) => s.auth)
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

export default function App() {
  const dispatch = useDispatch()
  const { token } = useSelector((s) => s.auth)

  useEffect(() => {
    if (token) dispatch(fetchUser())
  }, [dispatch, token])

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:slug" element={<ChallengeDetail />} />
        <Route path="/battles" element={<Battles />} />
        <Route path="/battles/:roomCode" element={<Battles />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/ai-mentor" element={<AIMentor />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      </Route>
    </Routes>
  )
}
