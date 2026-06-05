import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/client'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      accessToken:  null,
      refreshToken: null,
      isLoading:    false,
      error:        null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/login/', { email, password })
          set({
            accessToken:  data.access,
            refreshToken: data.refresh,
            user:         data.user,
            isLoading:    false,
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
          return { success: true }
        } catch (err) {
          const msg = err.response?.data?.detail || 'Login failed. Check credentials.'
          set({ isLoading: false, error: msg })
          return { success: false, error: msg }
        }
      },

      register: async (email, fullName, password, password2, role = 'analyst') => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await api.post('/auth/register/', {
            email,
            full_name: fullName,
            password,
            password2,
            role,
          })
          set({
            accessToken:  data.access,
            refreshToken: data.refresh,
            user:         data.user,
            isLoading:    false,
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`
          return { success: true }
        } catch (err) {
          const errors = err.response?.data
          const msg = typeof errors === 'object'
            ? Object.values(errors).flat().join(' ')
            : 'Registration failed.'
          set({ isLoading: false, error: msg })
          return { success: false, error: msg }
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null })
        delete api.defaults.headers.common['Authorization']
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'brandguard-auth',
      partialize: (state) => ({
        user:         state.user,
        accessToken:  state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)

export default useAuthStore
