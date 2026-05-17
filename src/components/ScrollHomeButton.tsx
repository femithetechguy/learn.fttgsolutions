'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home } from 'lucide-react'

export default function ScrollHomeButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Link
      href="/"
      title="Back to home"
      className={`hidden md:flex fixed bottom-8 right-8 z-50 items-center justify-center w-10 h-10 rounded-sm bg-bg-elevated border border-white/15 text-text-muted hover:text-text-primary hover:border-white/30 transition-all duration-200 bevel-sm ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <Home size={16} />
    </Link>
  )
}
