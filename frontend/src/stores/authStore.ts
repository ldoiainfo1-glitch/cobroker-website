import { create } from 'zustand'
import type { User } from '@/types'
import { supabase, fetchProfile } from '@/lib/supabase'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => Promise<void>
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  initAuth: async () => {
    set({ isLoading: true })

    // Check for an existing session
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      set({ user: profile, isAuthenticated: !!profile, isLoading: false })
    } else {
      set({ isLoading: false })
    }

    // Keep auth in sync for the lifetime of the app
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        set({ user: null, isAuthenticated: false, isLoading: false })
        return
      }
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session.user) {
        const profile = await fetchProfile(session.user.id)
        set({ user: profile, isAuthenticated: !!profile, isLoading: false })
      }
    })
  },
}))
