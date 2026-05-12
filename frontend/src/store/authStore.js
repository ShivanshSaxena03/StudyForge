import { create } from 'zustand'
import api from '../utils/api'

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('sf_user') || 'null'),
  token: localStorage.getItem('sf_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('sf_token', data.access_token)
      localStorage.setItem('sf_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.access_token, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Login failed', loading: false })
      return false
    }
  },

  signup: async (email, username, password, full_name) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/signup', { email, username, password, full_name })
      localStorage.setItem('sf_token', data.access_token)
      localStorage.setItem('sf_user', JSON.stringify(data.user))
      set({ user: data.user, token: data.access_token, loading: false })
      return true
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Signup failed', loading: false })
      return false
    }
  },

  logout: () => {
    localStorage.removeItem('sf_token')
    localStorage.removeItem('sf_user')
    set({ user: null, token: null })
  },

  clearError: () => set({ error: null }),
}))
