'use client'

import { Search, X, LucideIcon, BarChart2, Code2, Flame, Brain, Unlock, BookOpen, Users, Star, Tag, FileText, Package, Heart } from 'lucide-react'

export const ICON_MAP: Record<string, LucideIcon> = {
  BarChart2, Code2, Flame, Brain, Unlock, BookOpen, Users, Star, Tag, FileText, Package, Heart,
}

export interface PillColor {
  text: string
  bg: string
  border: string
}

export interface FilterPill {
  label: string
  icon?: string
  colors?: PillColor
}

interface Props {
  pills: FilterPill[]
  activePill: string | null
  onPillChange: (pill: string | null) => void
  search?: string
  onSearchChange?: (val: string) => void
  searchPlaceholder?: string
  resultCount?: number
  resultLabel?: string
}

export default function FilterBar({
  pills,
  activePill,
  onPillChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  resultCount,
  resultLabel = 'results',
}: Props) {
  return (
    <div className="space-y-4">
      {onSearchChange && (
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search ?? ''}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onPillChange(null)}
          className={`flex items-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 min-h-[44px] sm:min-h-[36px] ${
            activePill === null
              ? 'bg-gold text-bg-primary border-gold'
              : 'bg-white/5 text-text-secondary border-white/10 hover:border-white/20'
          }`}
        >
          All
        </button>

        {pills.map(({ label, icon, colors }) => {
          const isActive = activePill === label
          const Icon = icon ? ICON_MAP[icon] : null
          return (
            <button
              key={label}
              onClick={() => onPillChange(isActive ? null : label)}
              className="flex items-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 min-h-[44px] sm:min-h-[36px]"
              style={
                isActive && colors
                  ? { color: colors.text, background: colors.bg, borderColor: colors.text }
                  : isActive
                  ? { color: 'var(--color-gold)', background: 'rgba(212,175,55,0.1)', borderColor: 'var(--color-gold)' }
                  : { color: '#6b7280', background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.1)' }
              }
            >
              {Icon && <Icon size={13} />}
              {label}
            </button>
          )
        })}

        {resultCount !== undefined && (
          <span className="font-sans text-text-muted text-xs ml-auto hidden sm:block">
            {resultCount} {resultLabel}
          </span>
        )}
      </div>
    </div>
  )
}
