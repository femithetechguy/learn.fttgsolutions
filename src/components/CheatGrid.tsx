'use client'

import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface CheatItem     { name: string; syntax: string; definition: string }
export interface CheatCategory { category: string; items: CheatItem[] }

interface TooltipPos {
  top:       number
  left:      number
  placement: 'top' | 'bottom'
}

function CheatChip({ name, syntax, definition }: CheatItem) {
  const [open, setOpen] = useState(false)
  const [pos,  setPos]  = useState<TooltipPos | null>(null)
  const ref = useRef<HTMLSpanElement>(null)

  const calcPos = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({
      placement: rect.top > 90 ? 'top' : 'bottom',
      top:  rect.top > 90 ? rect.top - 8 : rect.bottom + 8,
      left: rect.left + rect.width / 2,
    })
  }

  return (
    <span
      ref={ref}
      className="group inline-flex items-center px-3 py-1.5 bg-bg-elevated border border-white/10 rounded-sm cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/5"
      onMouseEnter={() => { calcPos(); setOpen(true) }}
      onMouseLeave={() => setOpen(false)}
      onClick={() => { calcPos(); setOpen(v => !v) }}
    >
      <span className="font-mono text-xs text-text-secondary leading-none transition-colors duration-200 group-hover:text-text-primary">
        {name}
      </span>

      {open && pos && typeof window !== 'undefined' && createPortal(
        <span
          className="fixed z-[9999] w-80 bg-bg-elevated border border-white/20 rounded-sm shadow-2xl pointer-events-none overflow-hidden"
          style={{
            top:       pos.top,
            left:      pos.left,
            transform: pos.placement === 'top'
              ? 'translateX(-50%) translateY(-100%)'
              : 'translateX(-50%)',
          }}
        >
          <span className="block px-3 py-2 font-mono text-xs text-gold bg-white/[0.03] border-b border-white/10 leading-relaxed">
            {syntax}
          </span>
          <span className="block px-3 py-2 font-sans text-xs text-text-secondary leading-relaxed">
            {definition}
          </span>
        </span>,
        document.body
      )}
    </span>
  )
}

interface CheatGridProps {
  categories: CheatCategory[]
  columns?: 1 | 2 | 3
}

export default function CheatGrid({ categories, columns = 2 }: CheatGridProps) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 xl:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  }[columns]

  return (
    <div className={`grid ${colClass} gap-x-10 gap-y-3`}>
      {categories.map(row => (
        <div key={row.category} className="flex items-start gap-2 sm:gap-3">
          <span className="font-sans text-xs font-bold tracking-widest text-text-primary uppercase w-28 sm:w-36 shrink-0 pt-1.5 leading-tight">
            {row.category}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {row.items.map(item => (
              <CheatChip key={item.name} {...item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
