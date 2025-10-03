import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '../services/api'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: { name: string; email: string; password: string; companyName: string }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authService.login(email, password)
          if (response.success && response.data) {
            const { token, user } = response.data as { token: string; user: User }
            localStorage.setItem('authToken', token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            throw new Error(response.message || 'Login failed')
          }
        } catch (error) {
          set({ isLoading: false })
          console.error('Login error:', error)
          throw error
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await authService.register(userData)
          if (response.success && response.data) {
            const { token, user } = response.data as { token: string; user: User }
            localStorage.setItem('authToken', token)
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            throw new Error(response.message || 'Registration failed')
          }
        } catch (error) {
          set({ isLoading: false })
          console.error('Registration error:', error)
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('authToken')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      checkAuth: async () => {
        const token = localStorage.getItem('authToken')
        const userString = localStorage.getItem('user')
        
        if (!token || !userString) {
          set({ isAuthenticated: false, isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          // Use mock data from localStorage instead of API call
          const user = JSON.parse(userString) as User
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          console.error('Auth check error:', error)
          // Clear invalid data and set loading to false
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        }
      },

      setUser: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true,
          token: localStorage.getItem('authToken') || null
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)