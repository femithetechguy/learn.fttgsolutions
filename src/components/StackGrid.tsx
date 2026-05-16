'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Info } from 'lucide-react'
import { SI_MAP, CUSTOM_MAP } from '@/lib/brand-icons'

interface StackTool     { name: string; slug: string; color: string; definition?: string }
interface StackCategory { category: string; tools: StackTool[] }

interface TooltipPos {
  top:       number
  left:      number
  placement: 'top' | 'bottom'
}

function ToolChip({ slug, name, color, definition }: StackTool) {
  const path = (slug ? SI_MAP[slug]?.path : undefined) ?? (slug ? CUSTOM_MAP[slug] : undefined)
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

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open])

  return (
    <span
      ref={ref}
      className="group relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-bg-elevated border border-white/10 rounded-sm cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/5"
      onPointerEnter={(e) => { if (e.pointerType !== 'mouse') return; calcPos(); setOpen(true) }}
      onPointerLeave={(e) => { if (e.pointerType !== 'mouse') return; setOpen(false) }}
      onClick={(e) => { if ((e.nativeEvent as PointerEvent).pointerType === 'mouse') return; calcPos(); setOpen(v => !v) }}
    >
      {path && (
        <svg
          role="img"
          viewBox="0 0 24 24"
          width={13}
          height={13}
          fill={`#${color}`}
          aria-label={name}
          className="shrink-0 transition-transform duration-200 group-hover:scale-125"
        >
          <path d={path} />
        </svg>
      )}
      <span className="font-sans text-xs text-text-secondary leading-none transition-colors duration-200 group-hover:text-text-primary">
        {name}
      </span>
      {definition && (
        <Info
          size={10}
          className={`shrink-0 transition-colors duration-200 ${open ? 'text-gold' : 'text-text-muted opacity-40 group-hover:opacity-80 group-hover:text-text-secondary'}`}
        />
      )}

      {definition && open && pos && typeof window !== 'undefined' && createPortal(
        <span
          className="fixed z-[9999] w-72 px-3 py-2 bg-bg-elevated border border-white/20 rounded-sm font-sans text-xs text-text-primary shadow-2xl leading-relaxed whitespace-normal text-left pointer-events-none"
          style={{
            top:       pos.top,
            left:      pos.left,
            transform: pos.placement === 'top'
              ? 'translateX(-50%) translateY(-100%)'
              : 'translateX(-50%)',
          }}
        >
          {definition}
        </span>,
        document.body
      )}
    </span>
  )
}

interface StackGridProps {
  categories: StackCategory[]
  columns?: 1 | 2 | 3
}

export default function StackGrid({ categories, columns = 2 }: StackGridProps) {
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
            {row.tools.map(tool => (
              <ToolChip key={tool.name} {...tool} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
