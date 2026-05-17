'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollHomeButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
      className={`hidden md:flex fixed bottom-8 right-8 z-50 items-center justify-center w-10 h-10 rounded-sm bg-bg-elevated border border-white/15 text-text-muted hover:text-text-primary hover:border-white/30 transition-all duration-200 bevel-sm ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <ArrowUp size={16} />
    </button>
  )
}
