'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type UserRole = 'member' | 'guest' | null

interface AuthUser {
  email?: string
  name?: string
  role: UserRole
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  continueAsGuest: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  // Stub — wire your real backend here
  const login = async (email: string, _password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // TODO: Replace with real API call
      // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      // const data = await res.json()

      // Simulated success for frontend dev
      await new Promise(r => setTimeout(r, 800))
      if (!email.includes('@')) {
        return { success: false, error: 'Please enter a valid email address.' }
      }
      setUser({ email, name: email.split('@')[0], role: 'member' })
      return { success: true }
    } catch {
      return { success: false, error: 'Something went wrong. Please try again.' }
    }
  }

  const continueAsGuest = () => {
    setUser({ role: 'guest', name: 'Guest' })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: user !== null,
      login,
      continueAsGuest,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
