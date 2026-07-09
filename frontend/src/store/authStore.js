import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token })
        if (token) localStorage.setItem('token', token)
        else localStorage.removeItem('token')
      },

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const { data } = await authAPI.login(credentials)
          set({ user: data.user, token: data.token, isLoading: false })
          localStorage.setItem('token', data.token)
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Login failed' }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const { data } = await authAPI.register(userData)
          set({ user: data.user, token: data.token, isLoading: false })
          localStorage.setItem('token', data.token)
          return { success: true }
        } catch (err) {
          set({ isLoading: false })
          return { success: false, message: err.response?.data?.message || 'Registration failed' }
        }
      },

      logout: async () => {
        try { await authAPI.logout() } catch {}
        set({ user: null, token: null })
        localStorage.removeItem('token')
        localStorage.removeItem('auth-store')
      },

      refreshUser: async () => {
        try {
          const { data } = await authAPI.getMe()
          set({ user: data.user })
        } catch {
          get().logout()
        }
      },

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      isAuthenticated: () => !!get().token && !!get().user,
      isAdmin: () => ['admin', 'superadmin'].includes(get().user?.role),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)

export default useAuthStore
