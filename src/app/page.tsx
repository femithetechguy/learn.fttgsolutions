'use client'

import { useRouter } from 'next/navigation'
import LoginPage from '@/components/LoginPage'

export default function Home() {
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    // Stub — wire your real backend/NextAuth here
    await new Promise(r => setTimeout(r, 800))
    if (!email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' }
    }
    if (password.length < 4) {
      return { success: false, error: 'Password is too short.' }
    }
    router.push('/courses')
    return { success: true }
  }

  const handleGuest = () => {
    router.push('/courses')
  }

  return <LoginPage onLogin={handleLogin} onGuest={handleGuest} />
}
