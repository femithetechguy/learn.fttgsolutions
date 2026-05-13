'use client'

import { useState } from 'react'
import LoginPage from '@/components/LoginPage'
import Dashboard from '@/components/Dashboard'

type UserRole = 'member' | 'guest' | null

interface User {
  email?: string
  name?: string
  role: UserRole
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)

  const handleLogin = async (email: string, password: string) => {
    // Stub — wire your real backend/NextAuth here
    await new Promise(r => setTimeout(r, 800))
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' }
    }
    if (password.length < 4) {
      return { success: false, error: 'Password is too short.' }
    }
    const name = email.split('@')[0]
    setUser({ email, name, role: 'member' })
    return { success: true }
  }

  const handleGuest = () => {
    setUser({ role: 'guest', name: 'Guest' })
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} onGuest={handleGuest} />
  }

  return <Dashboard user={user} onLogout={handleLogout} />
}
