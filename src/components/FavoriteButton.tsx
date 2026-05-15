'use client'

import { useState, useRef, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/lib/userStore'

interface Props {
  id: string
  className?: string
}

export default function FavoriteButton({ id, className = '' }: Props) {
  const { favorites, auth, toggle } = useFavorites()
  const [showPrompt, setShowPrompt] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isFav = favorites.has(id)

  useEffect(() => {
    if (!showPrompt) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowPrompt(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showPrompt])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (auth === 'member') {
      toggle(id)
    } else {
      setShowPrompt(v => !v)
    }
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={handleClick}
        aria-label={isFav ? 'Remove from favourites' : 'Save to favourites'}
        className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150 hover:bg-white/10"
      >
        <Heart
          size={15}
          className={`transition-colors duration-150 ${
            isFav ? 'fill-gold stroke-gold' : 'stroke-text-muted hover:stroke-gold'
          }`}
        />
      </button>

      {showPrompt && (
        <div className="absolute right-0 top-9 z-50 w-52 bg-bg-secondary border border-white/10 rounded-md shadow-xl p-3 animate-fade-in">
          <p className="font-sans text-text-secondary text-xs leading-snug mb-2">
            Sign in to save favourites and access them anywhere.
          </p>
          <a
            href="/?view=register"
            className="block w-full text-center font-sans text-xs font-semibold py-1.5 rounded-sm bg-gold text-bg-primary hover:bg-gold/90 transition-colors"
          >
            Create account
          </a>
          <a
            href="/"
            className="block w-full text-center font-sans text-xs text-text-muted hover:text-gold transition-colors mt-1.5"
          >
            Sign in
          </a>
        </div>
      )}
    </div>
  )
}
