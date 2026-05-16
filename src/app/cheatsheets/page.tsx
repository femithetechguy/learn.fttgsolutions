'use client'

import { useState, useMemo } from 'react'
import { FileCode2, Search, X } from 'lucide-react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CheatGrid from '@/components/CheatGrid'
import sql    from '../../../data/cheatsheets/sql.json'
import python from '../../../data/cheatsheets/python.json'
import dax    from '../../../data/cheatsheets/dax.json'

const SHEETS = [
  { key: 'sql',    label: 'SQL',    color: '#4169E1', data: sql    },
  { key: 'python', label: 'Python', color: '#FFD43B', data: python },
  { key: 'dax',    label: 'DAX',    color: '#F2C811', data: dax    },
] as const

type SheetKey = typeof SHEETS[number]['key']

export default function CheatsheetsPage() {
  const [active, setActive] = useState<SheetKey>('sql')
  const [query,  setQuery]  = useState('')
  const sheet = SHEETS.find(s => s.key === active)!

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sheet.data.categories
    return sheet.data.categories
      .map(cat => ({
        ...cat,
        items: cat.items.filter(i => i.name.toLowerCase().includes(q)),
      }))
      .filter(cat => cat.items.length > 0)
  }, [query, sheet])

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">
      <Nav />

      <div className="overflow-x-hidden">

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 sm:w-[600px] h-64 sm:h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
            <div className="animate-fade-in flex items-start gap-4">
              <div className="w-11 h-11 rounded-sm flex items-center justify-center shrink-0 mt-1" style={{ background: `${sheet.color}18` }}>
                <FileCode2 size={20} style={{ color: sheet.color }} />
              </div>
              <div>
                <p className="font-sans text-sm text-text-muted tracking-widest uppercase mb-1">Cheat Sheets</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                  {sheet.data.headline}
                </h1>
                <p className="font-sans text-text-secondary text-lg mt-3 max-w-2xl">
                  {sheet.data.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="gold-line mx-8" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Sheet tabs + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
            <div className="flex items-center gap-2 flex-wrap">
              {SHEETS.map(s => (
                <button
                  key={s.key}
                  onClick={() => { setActive(s.key); setQuery('') }}
                  className={`font-sans text-sm font-semibold px-5 py-2 rounded-sm border transition-all duration-150 ${
                    active === s.key
                      ? 'text-bg-primary border-transparent'
                      : 'border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'
                  }`}
                  style={active === s.key ? { background: s.color, borderColor: s.color } : {}}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative sm:ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search commands…"
                className="w-full sm:w-56 bg-bg-elevated border border-white/10 rounded-sm pl-8 pr-8 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-white/25 transition-colors duration-150"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Tagline */}
          <p className="font-sans text-base font-semibold text-gold mb-8">
            {sheet.data.tagline}
          </p>

          {/* Cheat grid */}
          {filteredCategories.length > 0 ? (
            <CheatGrid categories={filteredCategories} columns={3} />
          ) : (
            <div className="py-16 flex flex-col items-center gap-2 text-center">
              <p className="font-display font-bold text-text-primary text-lg">No results for "{query}"</p>
              <p className="font-sans text-text-muted text-sm">Try a different name or clear the search.</p>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  )
}
