'use client'

import { useEffect, useRef } from 'react'
import { X, Clock, Play } from 'lucide-react'
import type { Lesson, CourseModule } from '@/types/course'

interface Props {
  courseTitle: string
  pillarColor: string
  modules: CourseModule[]
  activeLesson: Lesson
  onSelect: (lesson: Lesson) => void
  onClose: () => void
}

export default function PlaylistModal({ courseTitle, pillarColor, modules, activeLesson, onSelect, onClose }: Props) {
  const activeItemRef = useRef<HTMLButtonElement>(null)
  const allLessons = modules.flatMap(m => m.lessons)
  const activeIndex = allLessons.findIndex(l => l.id === activeLesson.id)

  // Scroll active item into view whenever selection changes
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeLesson.id])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080808]">

      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{ height: '52px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: pillarColor }}>
            {courseTitle} · {activeIndex + 1} of {allLessons.length}
          </p>
          <p className="text-[0.8rem] font-semibold leading-tight truncate text-text-primary">
            {activeLesson.title}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-sm bevel-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Body: player + sidebar ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">

        {/* Player */}
        <div className="flex-shrink-0 md:flex-1 md:min-h-0 relative bg-black">
          {/*
            Mobile:  padding-bottom 56.25% creates the 16:9 box; iframe fills it absolutely.
            Desktop: md:pb-0 + md:absolute md:inset-0 makes the inner div fill the flex container.
          */}
          <div className="relative pb-[56.25%] md:pb-0 md:absolute md:inset-0">
            {activeLesson.videoId ? (
              <iframe
                key={activeLesson.videoId}
                src={`https://www.youtube-nocookie.com/embed/${activeLesson.videoId}?autoplay=1&rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: 'none' }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                style={{ background: 'linear-gradient(160deg, #101310 0%, #141714 100%)' }}>
                <Clock size={32} style={{ color: 'rgba(232,228,208,0.22)' }} />
                <p className="text-sm font-semibold" style={{ color: 'rgba(232,228,208,0.5)' }}>Coming soon</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Playlist sidebar ── */}
        <div
          className="flex-1 md:flex-none overflow-y-auto"
          style={{
            width: undefined,
            borderTop: '1px solid rgba(255,255,255,0.07)',
            background: '#0d0d0d',
          }}
        >
          {/* Sidebar becomes fixed-width panel on desktop */}
          <div className="md:w-80 lg:w-[360px] md:h-full">

            {/* Sticky count header */}
            <div
              className="sticky top-0 z-10 px-4 py-2.5"
              style={{ background: '#0d0d0d', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Playlist · {allLessons.length} videos
              </p>
            </div>

            {modules.map((mod) => (
              <div key={mod.id}>
                {/* Module label */}
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    {mod.title}
                  </p>
                </div>

                {mod.lessons.map((lesson) => {
                  const isActive = lesson.id === activeLesson.id
                  const thumb = lesson.videoId
                    ? `https://img.youtube.com/vi/${lesson.videoId}/mqdefault.jpg`
                    : null

                  return (
                    <button
                      key={lesson.id}
                      ref={isActive ? activeItemRef : undefined}
                      onClick={() => onSelect(lesson)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
                      style={{ background: isActive ? 'rgba(212,175,55,0.08)' : undefined }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '' }}
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 relative rounded-sm overflow-hidden bg-[#1c1c1c]"
                        style={{ width: '88px', height: '50px' }}>
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Clock size={14} style={{ color: 'rgba(255,255,255,0.2)' }} />
                          </div>
                        )}
                        {/* Active play overlay */}
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center"
                            style={{ background: 'rgba(0,0,0,0.45)' }}>
                            <Play size={16} fill="white" style={{ color: 'white' }} />
                          </div>
                        )}
                        {/* Gold left accent bar */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: pillarColor }} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.72rem] leading-snug line-clamp-2"
                          style={{
                            color: isActive ? 'rgba(240,237,230,0.95)' : 'rgba(240,237,230,0.58)',
                            fontWeight: isActive ? 600 : 400,
                          }}>
                          {lesson.title}
                        </p>
                        <p className="text-[0.65rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                          {lesson.duration}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
