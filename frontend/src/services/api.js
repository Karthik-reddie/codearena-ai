import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
            params: { refresh_token: refreshToken },
          })
          localStorage.setItem('access_token', res.data.access_token)
          localStorage.setItem('refresh_token', res.data.refresh_token)
          error.config.headers.Authorization = `Bearer ${res.data.access_token}`
          return api(error.config)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (token) => api.post('/auth/google', { token }),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const challengesAPI = {
  list: (params) => api.get('/challenges/', { params }),
  get: (slug) => api.get(`/challenges/${slug}`),
  create: (data) => api.post('/challenges/', data),
  update: (id, data) => api.put(`/challenges/${id}`, data),
  delete: (id) => api.delete(`/challenges/${id}`),
  submit: (data) => api.post('/challenges/submit', data),
  getSubmissions: (params) => api.get('/challenges/submissions/history', { params }),
}

export const battlesAPI = {
  create: (data) => api.post('/battles/create', data),
  join: (roomCode) => api.post(`/battles/join/${roomCode}`),
  submit: (roomCode, data) => api.post(`/battles/submit/${roomCode}`, data),
  getActive: () => api.get('/battles/active'),
  get: (roomCode) => api.get(`/battles/${roomCode}`),
}

export const roadmapsAPI = {
  list: () => api.get('/roadmaps/'),
  get: (slug) => api.get(`/roadmaps/${slug}`),
  getProgress: (slug) => api.get(`/roadmaps/${slug}/progress`),
  updateProgress: (slug, data) => api.post(`/roadmaps/${slug}/progress`, data),
}

export const leaderboardAPI = {
  global: (params) => api.get('/leaderboard/global', { params }),
  weekly: (params) => api.get('/leaderboard/weekly', { params }),
}

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  explain: (data) => api.post('/ai/explain', data),
  generateQuiz: (data) => api.post('/ai/quiz', data),
  analyzeWeakness: () => api.post('/ai/analyze-weakness'),
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getHeatmap: () => api.get('/dashboard/heatmap'),
  getDailyGoals: () => api.get('/dashboard/daily-goals'),
  getRecentSubmissions: () => api.get('/dashboard/recent-submissions'),
}

export const notificationsAPI = {
  list: (params) => api.get('/notifications/', { params }),
  unreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/read/${id}`),
  markAllRead: () => api.put('/notifications/read-all'),
}

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserActive: (id) => api.put(`/admin/users/${id}/toggle-active`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, null, { params: { role } }),
}

export default api
