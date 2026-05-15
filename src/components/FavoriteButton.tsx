'use client'

import { useRef, useState } from 'react'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/lib/userStore'
import GuestGatePopup from '@/components/GuestGatePopup'

interface Props {
  id: string
  className?: string
}

export default function FavoriteButton({ id, className = '' }: Props) {
  const { favorites, auth, toggle } = useFavorites()
  const [showPrompt, setShowPrompt] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isFav = favorites.has(id)

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
    <div ref={ref} className={`inline-flex ${className}`}>
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
        <GuestGatePopup anchorRef={ref} onClose={() => setShowPrompt(false)} />
      )}
    </div>
  )
}
