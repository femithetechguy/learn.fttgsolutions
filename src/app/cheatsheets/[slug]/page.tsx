'use client'

import { useState, useMemo } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { FileCode2, Search, X, Share2, Printer, Check } from 'lucide-react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CheatGrid from '@/components/CheatGrid'
import { SHEETS } from '../../../../data/cheatsheets/registry'

export default function CheatsheetPage() {
  const { slug } = useParams<{ slug: string }>()
  const sheet = SHEETS.find(s => s.key === slug)
  if (!sheet) notFound()

  const [query,  setQuery]  = useState('')
  const [shared, setShared] = useState(false)
  const color = `#${sheet.data.color}`

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sheet.data.categories
    return sheet.data.categories
      .map(cat => {
        const categoryMatches = cat.category.toLowerCase().includes(q)
        return {
          ...cat,
          items: categoryMatches
            ? cat.items
            : cat.items.filter(i =>
                i.name.toLowerCase().includes(q) ||
                i.syntax.toLowerCase().includes(q) ||
                i.definition.toLowerCase().includes(q)
              ),
        }
      })
      .filter(cat => cat.items.length > 0)
  }, [query, sheet])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: sheet.data.headline, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">
      <Nav />

      <div className="overflow-x-hidden">

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 sm:w-[600px] h-64 sm:h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
            <div className="animate-fade-in flex items-start gap-4">
              <div className="w-11 h-11 rounded-sm flex items-center justify-center shrink-0 mt-1" style={{ background: `${color}18` }}>
                <FileCode2 size={20} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-text-muted tracking-widest uppercase mb-1">Cheat Sheets</p>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                    {sheet.data.headline}
                  </h1>
                  <div className="flex items-center gap-2 shrink-0 mt-2">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-white/30 text-text-primary bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-150 font-sans text-xs font-medium"
                      title="Share this cheat sheet"
                    >
                      {shared
                        ? <><Check size={13} className="text-green-400" /><span className="text-green-400">Copied!</span></>
                        : <><Share2 size={13} /><span className="hidden sm:inline">Share</span></>
                      }
                    </button>
                    <Link
                      href={`/cheatsheets/${slug}/print`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-white/30 text-text-primary bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-150 font-sans text-xs font-medium"
                      title="Print this cheat sheet"
                    >
                      <Printer size={13} />
                      <span className="hidden sm:inline">Print</span>
                    </Link>
                  </div>
                </div>
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
              {SHEETS.map(s => {
                const c = `#${s.data.color}`
                const isActive = s.key === slug
                return (
                  <Link
                    key={s.key}
                    href={`/cheatsheets/${s.key}`}
                    onClick={() => setQuery('')}
                    className={`font-sans text-sm font-semibold uppercase px-5 py-2 rounded-sm border transition-all duration-150 ${
                      isActive
                        ? 'text-bg-primary border-transparent'
                        : 'border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'
                    }`}
                    style={isActive ? { background: c, borderColor: c } : {}}
                  >
                    {s.data.label}
                  </Link>
                )
              })}
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
