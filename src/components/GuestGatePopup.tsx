'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  anchorRef: React.RefObject<HTMLElement | null>
  onClose: () => void
}

export default function GuestGatePopup({ anchorRef, onClose }: Props) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const width = 208
    const gap = 8
    let left = rect.right - width
    if (left < gap) left = rect.left
    setPos({
      top: rect.bottom + gap,
      left: Math.max(gap, Math.min(left, window.innerWidth - width - gap)),
    })
  }, [anchorRef])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      const inAnchor = anchorRef.current?.contains(target)
      const inPopup = popupRef.current?.contains(target)
      if (!inAnchor && !inPopup) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [anchorRef, onClose])

  if (!pos) return null

  return createPortal(
    <div
      ref={popupRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left }}
      className="z-[9999] w-52 bg-bg-secondary border border-white/10 rounded-md shadow-xl p-3 animate-fade-in"
    >
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
    </div>,
    document.body
  )
}
