'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { Layers, Search, X, Share2, Printer, Check } from 'lucide-react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import StackGrid from '@/components/StackGrid'
import dataBi     from '../../../../data/pillars/data-bi.json'
import appDev     from '../../../../data/pillars/app-dev.json'
import philosophy from '../../../../data/pillars/philosophy.json'

const PILLARS = [
  { key: 'data-bi',    label: 'Data & BI',  color: '#1D9E75', data: dataBi     },
  { key: 'app-dev',    label: 'App Dev',     color: '#378ADD', data: appDev     },
  { key: 'philosophy', label: 'Philosophy',  color: '#EF9F27', data: philosophy  },
] as const

export default function StackPillarPage() {
  const { pillar } = useParams<{ pillar: string }>()
  const current = PILLARS.find(p => p.key === pillar)
  if (!current) notFound()

  const [query,  setQuery]  = useState('')
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: current.data.headline, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 1500)
    }
  }

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return current.data.stack
    return current.data.stack
      .map(cat => ({
        ...cat,
        tools: cat.tools.filter(t => t.name.toLowerCase().includes(q)),
      }))
      .filter(cat => cat.tools.length > 0)
  }, [query, current])

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">
      <Nav />

      <div className="overflow-x-hidden">

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 sm:w-[600px] h-64 sm:h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
            <div className="animate-fade-in flex items-start gap-4">
              <div className="w-11 h-11 rounded-sm flex items-center justify-center shrink-0 mt-1" style={{ background: `${current.color}18` }}>
                <Layers size={20} style={{ color: current.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm text-text-muted tracking-widest uppercase mb-1">The Stack</p>
                <div className="flex items-start justify-between gap-4">
                  <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                    {current.data.headline}
                  </h1>
                  <div className="flex items-center gap-2 shrink-0 mt-2">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-white/30 text-text-primary bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-150 font-sans text-xs font-medium bevel"
                      title="Share this stack"
                    >
                      {shared
                        ? <><Check size={13} className="text-green-400" /><span className="text-green-400">Copied!</span></>
                        : <><Share2 size={13} /><span className="hidden sm:inline">Share</span></>
                      }
                    </button>
                    <Link
                      href={`/stack/${pillar}/print`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-white/30 text-text-primary bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-150 font-sans text-xs font-medium bevel"
                      title="Print this stack"
                    >
                      <Printer size={13} />
                      <span className="hidden sm:inline">Print</span>
                    </Link>
                  </div>
                </div>
                <p className="font-sans text-text-secondary text-lg mt-3 max-w-2xl">
                  {current.data.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="gold-line mx-8" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Pillar tabs + search row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-10">
            <div className="flex items-center gap-2 flex-wrap">
              {PILLARS.map(p => (
                <Link
                  key={p.key}
                  href={`/stack/${p.key}`}
                  onClick={() => setQuery('')}
                  className={`font-sans text-sm font-semibold px-5 py-2 rounded-sm border transition-all duration-150 ${
                    p.key === pillar
                      ? 'text-bg-primary border-transparent'
                      : 'border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'
                  }`}
                  style={p.key === pillar ? { background: p.color, borderColor: p.color } : {}}
                >
                  {p.label}
                </Link>
              ))}
            </div>

            <div className="relative sm:ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tools…"
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
            {current.data.tagline}
          </p>

          {/* Stack grid */}
          {filteredCategories.length > 0 ? (
            <StackGrid categories={filteredCategories} columns={3} />
          ) : (
            <div className="py-16 flex flex-col items-center gap-2 text-center">
              <p className="font-display font-bold text-text-primary text-lg">No tools match "{query}"</p>
              <p className="font-sans text-text-muted text-sm">Try a different name or clear the search.</p>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  )
}
