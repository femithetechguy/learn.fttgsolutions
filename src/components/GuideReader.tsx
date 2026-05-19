'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import GuideComments from './GuideComments'
import type { Guide } from '@/lib/guides'

export interface TocItem {
  id:    string
  text:  string
  level: number
}

interface Props {
  html:        string
  headings:    TocItem[]
  guide:       Guide
  pillarColor: string
  slug:        string
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\n?#]+)/)
  return m ? m[1] : null
}

function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop || document.body.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 h-[3px] bg-gold z-50 transition-all duration-75 ease-linear"
      style={{ width: `${pct}%` }}
    />
  )
}

export default function GuideReader({ html, headings, guide, pillarColor, slug }: Props) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '')
  const [tocOpen, setTocOpen]   = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  /* Track active section with IntersectionObserver */
  useEffect(() => {
    if (headings.length === 0) return
    const targets = headings
      .map(h => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          )
          setActiveId((topmost.target as HTMLElement).id)
        }
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 }
    )
    targets.forEach(t => observer.observe(t))
    return () => observer.disconnect()
  }, [headings])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTocOpen(false)
  }

  const ytId = guide.video_url ? getYouTubeId(guide.video_url) : null

  return (
    <>
      <ReadingProgress />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="lg:flex lg:gap-10 xl:gap-14">

          {/* ── Sidebar TOC (desktop) ── */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-48 xl:w-56 flex-shrink-0">
              <div className="sticky top-24 space-y-1">
                <p className="font-sans text-[0.65rem] font-bold uppercase tracking-widest text-text-muted mb-3">
                  In this guide
                </p>
                {headings.map(h => {
                  const active = h.id === activeId
                  return (
                    <button
                      key={h.id}
                      onClick={() => scrollTo(h.id)}
                      className="block w-full text-left transition-colors duration-150 leading-snug py-0.5"
                      style={{
                        paddingLeft: h.level === 3 ? '0.875rem' : '0',
                        fontSize: '0.72rem',
                        color: active ? pillarColor : 'rgba(160,153,142,0.7)',
                        fontWeight: active ? 600 : 400,
                        fontFamily: 'var(--font-sans, sans-serif)',
                      }}
                    >
                      {h.level === 3 && (
                        <span className="mr-1 opacity-40">—</span>
                      )}
                      {h.text}
                    </button>
                  )
                })}
              </div>
            </aside>
          )}

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Mobile TOC accordion */}
            {headings.length > 0 && (
              <div className="lg:hidden mb-6 border border-white/10 rounded-sm overflow-hidden">
                <button
                  onClick={() => setTocOpen(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white/4 hover:bg-white/6 transition-colors"
                >
                  <span className="font-sans text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Contents
                  </span>
                  {tocOpen
                    ? <ChevronDown size={14} className="text-text-muted" />
                    : <ChevronRight size={14} className="text-text-muted" />
                  }
                </button>
                {tocOpen && (
                  <div className="px-4 py-3 space-y-1 bg-white/2">
                    {headings.map(h => (
                      <button
                        key={h.id}
                        onClick={() => scrollTo(h.id)}
                        className="block w-full text-left font-sans text-xs leading-snug py-1"
                        style={{
                          paddingLeft: h.level === 3 ? '0.875rem' : '0',
                          color: h.id === activeId ? pillarColor : 'rgba(160,153,142,0.8)',
                          fontWeight: h.id === activeId ? 600 : 400,
                        }}
                      >
                        {h.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Video player */}
            {guide.video_url && (
              <div className="mb-10">
                {ytId ? (
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden border border-white/10 bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={guide.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video rounded-sm overflow-hidden border border-white/10 bg-black">
                    <video
                      src={guide.video_url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Thumbnail (shown only when no video) */}
            {!guide.video_url && guide.thumbnail && (
              <div className="mb-10 rounded-sm overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={guide.thumbnail}
                  alt={guide.title}
                  className="w-full object-cover max-h-72"
                />
              </div>
            )}

            {/* Guide body */}
            <div
              ref={contentRef}
              className="article-body"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <GuideComments slug={slug} />
          </div>

        </div>
      </div>
    </>
  )
}
