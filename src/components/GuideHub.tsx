'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Fuse from 'fuse.js'
import {
  Search, X, Clock, ChevronDown,
  BookOpen, ArrowUp, Link as LinkIcon, Printer, Check, Share2
} from 'lucide-react'
import Link from 'next/link'
import type { Guide } from '@/lib/guides'

export interface TocItem { id: string; text: string; level: number }

interface GuideContent { html: string; headings: TocItem[] }

interface Props {
  guides:      Guide[]
  contents:    Record<string, GuideContent>
  initialSlug?: string
}

const PILLARS = [
  { key: 'crossover',  label: 'Crossover',  color: '#A78BFA' },
  { key: 'data-bi',    label: 'Data & BI',  color: '#1D9E75' },
  { key: 'app-dev',    label: 'App Dev',     color: '#378ADD' },
  { key: 'philosophy', label: 'Philosophy',  color: '#EF9F27' },
] as const

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function injectHighlight(html: string, query: string): string {
  if (!query.trim()) return html
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${escaped})`, 'gi')
  const style = 'background:rgba(239,159,39,0.45);color:inherit;border-radius:3px;animation:fttg-hl 3s ease forwards;'
  // Only replace inside text nodes (between > and <), never inside tag attributes
  return html.replace(/>([^<]+)</g, (_, text) =>
    '>' + text.replace(re, `<mark style="${style}">$1</mark>`) + '<'
  )
}

function getYtId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/)
  return m ? m[1] : null
}

function highlight(text: string, query: string) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(239,159,39,0.35)', color: 'inherit', borderRadius: '2px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function bodySnippet(body: string, query: string, radius = 60): string {
  const idx = body.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return ''
  const start = Math.max(0, idx - radius)
  const end   = Math.min(body.length, idx + query.length + radius)
  return (start > 0 ? '…' : '') + body.slice(start, end) + (end < body.length ? '…' : '')
}

/* ── Top-level so React never remounts it on re-render ── */
function GuideItem({
  guide, activeSlug, isSearching, query, bodyOnly, onSelect,
}: {
  guide: Guide & { body?: string }
  activeSlug: string
  isSearching: boolean
  query: string
  bodyOnly: boolean
  onSelect: (slug: string) => void
}) {
  const isActive   = guide.slug === activeSlug
  const gPillar    = PILLARS.find(p => p.key === guide.pillar)
  const snippet    = bodyOnly && guide.body ? bodySnippet(guide.body, query) : ''
  const tipSnippet = isSearching && guide.body ? bodySnippet(guide.body, query, 100) : ''

  const btnRef                          = useRef<HTMLButtonElement>(null)
  const [tipPos, setTipPos]             = useState<{ top: number; left: number } | null>(null)

  const showTip = () => {
    if (!tipSnippet || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const top  = Math.min(Math.max(rect.top, 8), window.innerHeight - 180)
    setTipPos({ top, left: rect.right + 12 })
  }

  return (
    <button
      ref={btnRef}
      onClick={() => onSelect(guide.slug)}
      className="w-full min-w-0 flex items-start gap-2.5 pl-4 pr-3 py-2 text-left transition-colors"
      style={{ background: isActive ? `${gPillar?.color}14` : undefined }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
        showTip()
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = ''
        setTipPos(null)
      }}
    >
      <div className="flex-shrink-0 mt-[4px]" style={{
        width: 10, height: 10, borderRadius: '50%',
        border: isActive ? `2px solid ${gPillar?.color}` : '1.5px solid rgba(255,255,255,0.22)',
        background: isActive ? gPillar?.color : 'transparent',
        boxShadow: isActive ? `0 0 5px ${gPillar?.color}55` : 'none',
      }} />
      <div className="flex-1 min-w-0">
        <p className="text-[0.71rem] leading-snug line-clamp-2" style={{
          color: isActive ? 'rgba(240,237,230,0.95)' : 'rgba(240,237,230,0.52)',
          fontWeight: isActive ? 600 : 400,
        }}>
          {isSearching ? highlight(guide.title, query) : guide.title}
        </p>
        {snippet && (
          <p className="text-[0.62rem] leading-snug mt-0.5 line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {highlight(snippet, query)}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          {isSearching && gPillar && (
            <span className="text-[0.58rem] font-bold uppercase tracking-wider" style={{ color: gPillar.color }}>
              {gPillar.label}
            </span>
          )}
          <span className="flex items-center gap-0.5 text-[0.6rem]" style={{ color: 'rgba(255,255,255,0.28)' }}>
            <Clock size={9} />
            {guide.readTime}m
          </span>
        </div>
      </div>

      {tipPos && typeof window !== 'undefined' && createPortal(
        <div
          className="fixed z-[9999] w-72 pointer-events-none rounded-sm border border-white/15 shadow-2xl"
          style={{
            top:        tipPos.top,
            left:       tipPos.left,
            background: 'rgba(18,18,20,0.97)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="px-3 pt-2.5 pb-1 border-b border-white/8">
            <p className="font-sans text-[0.65rem] font-bold uppercase tracking-wider leading-snug" style={{ color: gPillar?.color }}>
              {guide.title}
            </p>
          </div>
          <p className="px-3 py-2.5 font-sans text-[0.72rem] leading-relaxed line-clamp-5" style={{ color: 'rgba(240,237,230,0.72)' }}>
            {highlight(tipSnippet, query)}
          </p>
        </div>,
        document.body
      )}
    </button>
  )
}

export default function GuideHub({ guides, contents, initialSlug }: Props) {
  const [activeSlug, setActiveSlug]             = useState(
    initialSlug && guides.some(g => g.slug === initialSlug) ? initialSlug : (guides[0]?.slug ?? '')
  )
  const [query, setQuery]                       = useState('')
  const [expanded, setExpanded]                 = useState<Set<string>>(new Set(PILLARS.map(p => p.key)))
  const [mobileOpen, setMobileOpen]             = useState(false)
  const [tocOpen, setTocOpen]                   = useState(false)
  const [scrollTopVisible, setScrollTopVisible] = useState(false)
  const [scrollTick, setScrollTick]             = useState(0)
  const pendingScrollRef                        = useRef('')
  const [highlightQuery, setHighlightQuery]     = useState('')
  const highlightClearRef                       = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [shared, setShared]                     = useState(false)
  const [copied, setCopied]                     = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const onScroll = () => setScrollTopVisible(el.scrollTop > 400)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const indexedGuides = useMemo(
    () => guides.map(g => ({ ...g, body: stripHtml(contents[g.slug]?.html ?? '') })),
    [guides, contents]
  )

  const titleFuse = useMemo(() => new Fuse(indexedGuides, {
    keys: [
      { name: 'title',    weight: 0.6 },
      { name: 'subtitle', weight: 0.4 },
    ],
    threshold: 0.4,
    includeScore: true,
  }), [indexedGuides])

  const bodyFuse = useMemo(() => new Fuse(indexedGuides, {
    keys: ['body'],
    threshold: 0.3,
    ignoreLocation: true,
    includeScore: true,
  }), [indexedGuides])

  const isSearching   = query.trim().length > 0
  const searchResults = useMemo(() => {
    if (!isSearching) return []
    const titleHits   = titleFuse.search(query).map(r => r.item)
    const titleSlugs  = new Set(titleHits.map(g => g.slug))
    const bodyHits    = bodyFuse.search(query).map(r => r.item).filter(g => !titleSlugs.has(g.slug))
    return [
      ...titleHits.map(g => ({ guide: g, bodyOnly: false })),
      ...bodyHits.map(g => ({ guide: g, bodyOnly: true })),
    ]
  }, [query, titleFuse, bodyFuse, isSearching])

  const activeGuide   = guides.find(g => g.slug === activeSlug)
  const activeContent = contents[activeSlug]
  const activePillar  = PILLARS.find(p => p.key === activeGuide?.pillar)
  const pillarColor   = activePillar?.color ?? '#D4AF37'

  const togglePillar = (key: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })

  const selectGuide = (slug: string) => {
    setActiveSlug(slug)
    setMobileOpen(false)
    setTocOpen(false)
    if (contentRef.current) contentRef.current.scrollTop = 0
    const q = query.trim()
    if (q) {
      pendingScrollRef.current = q
      setScrollTick(t => t + 1)
      setHighlightQuery(q)
      if (highlightClearRef.current) clearTimeout(highlightClearRef.current)
      highlightClearRef.current = setTimeout(() => setHighlightQuery(''), 3200)
    }
    window.history.pushState(null, '', `/guides/${slug}`)
  }

  useEffect(() => {
    if (scrollTick === 0) return
    pendingScrollRef.current = ''

    // 80ms lets React commit the new highlighted HTML before we measure the DOM
    const timerId = setTimeout(() => {
      const container = contentRef.current
      const articleEl = container?.querySelector('.article-body')
      if (!articleEl || !container) return
      const firstMark = articleEl.querySelector('mark')
      if (!firstMark) return
      const markRect     = firstMark.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const targetTop    = container.scrollTop + markRect.top - containerRect.top - 120
      container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
    }, 80)

    return () => clearTimeout(timerId)
  }, [scrollTick])

  /* Called as functions, NOT as <Component /> — avoids remount */
  const renderSearch = () => (
    <div className="p-3 border-b border-white/8 flex-shrink-0">
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.3)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search all guides..."
          className="w-full pl-7 pr-6 py-1.5 rounded-sm font-sans text-[0.72rem] placeholder:text-text-muted focus:outline-none focus:border-white/20"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(240,237,230,0.9)',
            fontSize: '16px',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2">
            <X size={11} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        )}
      </div>
    </div>
  )

  const renderGuideList = () => (
    <div className="flex-1 overflow-y-auto py-1">
      {isSearching ? (
        searchResults.length > 0 ? (
          <>
            <p className="px-4 pt-2 pb-1 text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </p>
            {searchResults.map(({ guide: g, bodyOnly }) => (
              <GuideItem key={g.slug} guide={g} activeSlug={activeSlug} isSearching={isSearching} query={query} bodyOnly={bodyOnly} onSelect={selectGuide} />
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
            <Search size={18} style={{ color: 'rgba(255,255,255,0.18)' }} />
            <p className="text-[0.72rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              No results for &ldquo;{query}&rdquo;
            </p>
          </div>
        )
      ) : (
        PILLARS.map(p => {
          const items = guides.filter(g => g.pillar === p.key)
          if (items.length === 0) return null
          const isExpanded = expanded.has(p.key)
          return (
            <div key={p.key}>
              <button
                onClick={() => togglePillar(p.key)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-[0.7rem] font-semibold leading-snug" style={{ color: 'rgba(240,237,230,0.72)' }}>
                    {p.label}
                  </p>
                  <p className="text-[0.6rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    {items.length} guide{items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronDown
                  size={13}
                  className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                />
              </button>
              {isExpanded && items.map(g => (
                <GuideItem key={g.slug} guide={g} activeSlug={activeSlug} isSearching={isSearching} query={query} bodyOnly={false} onSelect={selectGuide} />
              ))}
            </div>
          )
        })
      )}
    </div>
  )

  const ytId = activeGuide?.video_url ? getYtId(activeGuide.video_url) : null

  return (
    <div className="flex flex-1 overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex flex-col w-56 xl:w-64 flex-shrink-0 border-r border-white/8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.015)' }}>
        {renderSearch()}
        {renderGuideList()}
      </div>

      {/* ── Main content area ── */}
      <div ref={contentRef} className="flex-1 overflow-y-auto bg-bg-primary bg-grid">

        {/* Mobile guide selector */}
        <div className="lg:hidden sticky top-0 z-10 border-b border-white/8 bg-bg-primary">
          {/* Search — always visible on mobile */}
          {renderSearch()}
          {/* Current guide + toggle */}
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/4 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={13} style={{ color: activePillar?.color ?? '#D4AF37' }} />
              <span className="font-sans text-xs font-semibold" style={{ color: 'rgba(240,237,230,0.72)' }}>
                {activeGuide?.title ?? 'Select a guide'}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${mobileOpen ? 'rotate-180' : ''}`}
              style={{ color: 'rgba(255,255,255,0.3)' }}
            />
          </button>
          {(mobileOpen || isSearching) && (
            <div className="flex flex-col border-t border-white/8 max-h-60 overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
              {renderGuideList()}
            </div>
          )}
        </div>

        {/* Guide body */}
        {activeGuide && activeContent ? (
          <div className="max-w-3xl mx-auto px-5 sm:px-8 py-8">

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className="tag-pill font-semibold"
                  style={{ color: pillarColor, background: `${pillarColor}18`, border: `1px solid ${pillarColor}33` }}
                >
                  {activePillar?.label}
                </span>
                {activeGuide.author && (
                  <span className="font-sans text-xs text-text-muted">By {activeGuide.author}</span>
                )}
                <span className="flex items-center gap-1 font-sans text-xs text-text-muted">
                  <Clock size={11} />
                  {activeGuide.readTime} min read
                </span>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={async () => {
                    const url = window.location.href
                    if (navigator.share) {
                      try { await navigator.share({ title: activeGuide.title, url }) } catch {}
                    } else {
                      await navigator.clipboard.writeText(url)
                      setShared(true)
                      setTimeout(() => setShared(false), 1500)
                    }
                  }}
                  title="Share guide"
                  className="w-8 h-8 flex items-center justify-center rounded-sm bevel-sm transition-colors"
                  style={{ color: shared ? '#4ade80' : 'rgba(255,255,255,0.68)' }}
                >
                  {shared ? <Check size={13} /> : <Share2 size={13} />}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  title="Copy link"
                  className="w-8 h-8 flex items-center justify-center rounded-sm bevel-sm transition-colors"
                  style={{ color: copied ? '#4ade80' : 'rgba(255,255,255,0.68)' }}
                >
                  {copied ? <Check size={13} /> : <LinkIcon size={13} />}
                </button>
                <Link
                  href={`/guides/${activeGuide.slug}/print`}
                  title="Print guide"
                  className="w-8 h-8 flex items-center justify-center rounded-sm bevel-sm transition-colors"
                  style={{ color: 'rgba(255,255,255,0.68)' }}
                >
                  <Printer size={13} />
                </Link>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-primary leading-tight mb-3">
              {activeGuide.title}
            </h1>
            <p className="font-sans text-text-secondary text-base leading-relaxed mb-6">
              {activeGuide.subtitle}
            </p>

            {activeGuide.video_url && (
              <div className="mb-8">
                {ytId ? (
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden border border-white/10 bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={activeGuide.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden border border-white/10 bg-black">
                    <video src={activeGuide.video_url} controls className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            )}

            {!activeGuide.video_url && activeGuide.thumbnail && (
              <div className="mb-8 rounded-sm overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeGuide.thumbnail} alt={activeGuide.title} className="w-full object-cover max-h-64" />
              </div>
            )}

            {activeContent.headings.length > 0 && (
              <div className="mb-8 border border-white/10 rounded-sm overflow-hidden">
                <button
                  onClick={() => setTocOpen(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/4 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.025)' }}
                >
                  <span className="font-sans text-[0.65rem] font-bold uppercase tracking-widest text-text-muted">
                    In this guide
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${tocOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'rgba(255,255,255,0.3)' }}
                  />
                </button>
                {tocOpen && (
                  <div className="px-4 py-2 space-y-0.5">
                    {activeContent.headings.map(h => (
                      <button
                        key={h.id}
                        onClick={() => document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="block w-full text-left font-sans text-[0.72rem] py-1 text-text-secondary hover:text-text-primary transition-colors"
                        style={{ paddingLeft: h.level === 3 ? '1rem' : '0' }}
                      >
                        {h.level === 3 && <span className="mr-1 opacity-40 text-[0.6rem]">—</span>}
                        {h.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="article-body" dangerouslySetInnerHTML={{ __html: injectHighlight(activeContent.html, highlightQuery) }} />

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
            <BookOpen size={28} style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p className="font-sans text-sm text-text-muted">Select a guide to start reading.</p>
          </div>
        )}
      </div>

      {/* Scroll-to-top */}
      <button
        onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top"
        className={`flex fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50 items-center justify-center w-10 h-10 rounded-sm bg-bg-elevated border border-white/15 text-text-muted hover:text-text-primary hover:border-white/30 transition-all duration-200 bevel-sm ${
          scrollTopVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <ArrowUp size={16} />
      </button>

    </div>
  )
}
