import { useState, useEffect } from 'react'

const AUTH_KEY = 'fttg_auth'
const FAV_KEY  = 'fttg_favorites'

export type AuthState = 'member' | 'guest' | null

export function getAuthState(): AuthState {
  if (typeof window === 'undefined') return null
  return (localStorage.getItem(AUTH_KEY) as AuthState) ?? null
}

export function setAuthState(state: AuthState) {
  if (state) localStorage.setItem(AUTH_KEY, state)
  else localStorage.removeItem(AUTH_KEY)
}

function loadFavs(): string[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]') } catch { return [] }
}

export function useFavorites() {
  const [favorites, setFavs] = useState<Set<string>>(new Set())
  const [auth, setAuth] = useState<AuthState>(null)

  useEffect(() => {
    setFavs(new Set(loadFavs()))
    setAuth(getAuthState())
  }, [])

  const toggle = (id: string) => {
    setFavs(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(next)))
      return next
    })
  }

  return { favorites, auth, toggle }
}
