import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) =>
        set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        sessionStorage.removeItem('access_token')
        set({ user: null, isAuthenticated: false, isLoading: false })
      },
    }),
    {
      name: 'cobrokings-auth',
      partialState: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    } as Parameters<typeof persist>[1],
  ),
)
