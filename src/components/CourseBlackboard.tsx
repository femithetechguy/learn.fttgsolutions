'use client'

import { useState } from 'react'
import { X, Clock } from 'lucide-react'

export interface Lesson {
  id: string
  title: string
  duration: string
  videoId: string
  free: boolean
  description?: string
}

export interface CourseModule {
  id: string
  title: string
  lessons: Lesson[]
}

export interface CourseDetail {
  slug: string
  title: string
  subtitle: string
  pillar: string
  pillarLabel: string
  pillarColor: string
  level: string
  totalDuration: string
  free: boolean
  modules: CourseModule[]
}

const CHALK  = "var(--font-chalk, 'Courier New', Courier, monospace)"
const c      = (a = 1) => `rgba(232,228,208,${a})`
const glow   = (a = 0.14) => `0 0 10px rgba(232,228,208,${a}), 0 1px 3px rgba(0,0,0,0.9)`

const MARKERS: { cap: string }[] = [
  { cap: '#1a1a1a' },
  { cap: '#cc2020' },
  { cap: '#1a36cc' },
  { cap: '#1a1a1a' },
]

export default function CourseBlackboard({ course }: { course: CourseDetail }) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const total = course.modules.reduce((s, m) => s + m.lessons.length, 0)

  return (
    <>
      {/* ── Outer wooden frame ── */}
      <div
        className="w-full rounded-sm relative select-none"
        style={{
          background: 'linear-gradient(160deg, #7a4218 0%, #9a5220 18%, #8a4818 55%, #5c2e0a 100%)',
          padding: '28px 16px 0',          // extra top space for tray decorations
          boxShadow: [
            '0 20px 60px rgba(0,0,0,0.85)',
            'inset 0 1px 0 rgba(255,255,255,0.11)',
            'inset 0 -2px 4px rgba(0,0,0,0.6)',
            'inset 1px 0 0 rgba(255,255,255,0.06)',
            'inset -1px 0 0 rgba(0,0,0,0.45)',
          ].join(','),
        }}
      >
        {/* ── Top-frame decorations ── */}
        {/* Eraser holder / clip — centre top */}
        <div
          className="absolute z-30"
          style={{
            top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '60px', height: '22px',
            background: 'linear-gradient(180deg, #1c1c1c, #0a0a0a)',
            borderRadius: '0 0 5px 5px',
            boxShadow: '0 3px 8px rgba(0,0,0,0.8), inset 0 -1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ margin: '6px auto 0', width: '32px', height: '5px', background: '#333', borderRadius: '2px' }} />
        </div>

        {/* Marker resting on top ledge — right of centre */}
        <div className="absolute z-30 flex" style={{ top: '6px', right: '80px' }}>
          <ExpoMarker cap="#222" />
        </div>

        {/* Corner screws (top only — bottom are on tray) */}
        <Screw style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 20 }} />
        <Screw style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20 }} />

        {/* ── Board surface ── */}
        <div
          style={{
            minHeight: '520px',
            background: 'linear-gradient(155deg, #131715 0%, #0c1110 45%, #101310 100%)',
            borderRadius: '2px',
            boxShadow: [
              'inset 0 2px 12px rgba(0,0,0,0.7)',
              'inset 0 0 60px rgba(0,0,0,0.3)',
            ].join(','),
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle chalk-dust smears */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: [
              'radial-gradient(ellipse 200px 80px at 10% 20%, rgba(255,255,255,0.012) 0%, transparent 100%)',
              'radial-gradient(ellipse 150px 60px at 78% 65%, rgba(255,255,255,0.009) 0%, transparent 100%)',
            ].join(','),
          }} />

          {/* Board content */}
          <div className="relative z-10 px-7 pt-6 pb-10" style={{ fontFamily: CHALK }}>

            {/* ── Course header ── */}
            <p className="text-[11px] uppercase tracking-[0.18em] mb-2"
              style={{ color: course.pillarColor, textShadow: `0 0 10px ${course.pillarColor}55` }}>
              {course.pillarLabel} – {course.level} · {course.totalDuration}
            </p>

            <div>
              <h1 className="text-[1.85rem] sm:text-[2.1rem] leading-tight"
                style={{ color: c(0.93), textShadow: glow(0.22), letterSpacing: '0.01em' }}>
                {course.title}
              </h1>
              {/* Chalk underline beneath title */}
              <div style={{
                height: '1.5px',
                marginTop: '5px',
                marginBottom: '10px',
                width: '100%',
                background: 'linear-gradient(90deg, rgba(232,228,208,0.35) 0%, rgba(232,228,208,0.18) 75%, transparent 100%)',
                borderRadius: '1px',
              }} />
            </div>

            <p className="text-[0.8rem] leading-relaxed mb-1.5" style={{ color: c(0.5), textShadow: glow(0.06) }}>
              {course.subtitle}
            </p>
            <p className="text-[0.72rem] mb-5" style={{ color: c(0.35) }}>
              {course.modules.length} modules · {total} lessons
            </p>

            {/* Chalk divider */}
            <div style={{
              height: '1px',
              marginBottom: '20px',
              background: 'linear-gradient(90deg, transparent, rgba(232,228,208,0.2) 12%, rgba(232,228,208,0.16) 88%, transparent)',
            }} />

            {/* ── Modules ── */}
            <div className="space-y-8">
              {course.modules.map((mod, mi) => (
                <div key={mod.id}>
                  <p className="text-[10px] uppercase tracking-[0.18em] mb-0.5"
                    style={{
                      color: c(0.38),
                      textDecoration: 'underline',
                      textDecorationColor: c(0.16),
                      textUnderlineOffset: '3px',
                    }}>
                    Module {mi + 1}
                  </p>
                  <h2 className="text-[1.02rem] mb-3" style={{ color: c(0.83), textShadow: glow(0.1) }}>
                    {mod.title}
                  </h2>

                  {/* 2-column lesson grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {mod.lessons.map((lesson, li) => (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className="chalk-card text-left"
                        style={{ fontFamily: CHALK }}
                      >
                        <div className="flex items-start gap-3 p-3 sm:p-3.5">
                          {/* Circled number */}
                          <div className="flex-shrink-0 flex items-center justify-center" style={{
                            width: '22px', height: '22px',
                            borderRadius: '50%',
                            border: `1.5px solid ${c(lesson.videoId ? 0.48 : 0.24)}`,
                            fontSize: '11px',
                            color: lesson.videoId ? c(0.72) : c(0.32),
                            lineHeight: 1, marginTop: '1px',
                          }}>
                            {li + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.78rem] leading-snug" style={{
                              color: lesson.videoId ? c(0.88) : c(0.4),
                              textShadow: lesson.videoId ? glow(0.09) : 'none',
                            }}>
                              {lesson.title}
                            </p>
                            <p className="text-[0.68rem] mt-1" style={{ color: c(0.3) }}>
                              {lesson.duration}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Marker tray ── */}
        <div
          className="relative flex items-center"
          style={{
            height: '48px',
            background: 'linear-gradient(180deg, #7a4015 0%, #5a2e0c 55%, #3a1e06 100%)',
            borderTop: '3px solid rgba(0,0,0,0.6)',
            borderRadius: '0 0 3px 3px',
            boxShadow: 'inset 0 5px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
            paddingLeft: '18px',
            paddingRight: '16px',
            gap: '14px',
          }}
        >
          {/* Tray ledge line */}
          <div className="absolute" style={{
            top: '9px', left: '8px', right: '8px', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(232,228,208,0.06) 15%, rgba(232,228,208,0.05) 85%, transparent)',
          }} />

          {/* Bottom screws */}
          <Screw style={{ position: 'absolute', bottom: '10px', left: '8px', zIndex: 20 }} />
          <Screw style={{ position: 'absolute', bottom: '10px', right: '8px', zIndex: 20 }} />

          {/* Felt eraser */}
          <BoardEraser />

          {/* Expo markers */}
          {MARKERS.map((m, i) => (
            <ExpoMarker key={i} cap={m.cap} />
          ))}
        </div>
      </div>

      {/* ── Video modal ── */}
      {activeLesson && (
        <VideoModal
          lesson={activeLesson}
          pillarColor={course.pillarColor}
          onClose={() => setActiveLesson(null)}
        />
      )}
    </>
  )
}

/* ── Sub-components ── */

function Screw({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      width: '12px', height: '12px', borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, #b8a888, #3c2c1c)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <div style={{ width: '55%', height: '1.5px', background: 'rgba(0,0,0,0.5)', borderRadius: '1px', transform: 'rotate(45deg)' }} />
    </div>
  )
}

function BoardEraser() {
  return (
    <div style={{
      width: '78px', height: '28px', flexShrink: 0,
      background: 'linear-gradient(180deg, #2a2a2a 0%, #181818 100%)',
      borderRadius: '4px',
      boxShadow: '0 3px 8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Felt strip at bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: '3px', right: '3px', height: '9px',
        background: 'linear-gradient(180deg, #3a2c20, #2a1c10)',
        borderRadius: '0 0 2px 2px',
      }} />
      {/* Top highlight */}
      <div style={{
        position: 'absolute', top: '4px', left: '8px', right: '8px', height: '2px',
        background: 'rgba(255,255,255,0.07)', borderRadius: '1px',
      }} />
    </div>
  )
}

function ExpoMarker({ cap }: { cap: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '15px', flexShrink: 0 }}>
      {/* Coloured cap (left end) */}
      <div style={{
        width: '16px', height: '15px',
        background: `linear-gradient(180deg, ${cap}cc 0%, ${cap} 100%)`,
        borderRadius: '4px 0 0 4px',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.35)`,
      }} />
      {/* White body */}
      <div style={{
        width: '70px', height: '13px',
        background: 'linear-gradient(180deg, #f4f4f4 0%, #d4d4d4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18)',
      }}>
        <span style={{ fontSize: '6px', fontWeight: 900, color: '#444', letterSpacing: '1.5px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
          expo
        </span>
      </div>
      {/* Black felt tip (right end) */}
      <div style={{
        width: '7px', height: '9px',
        background: '#2a2a2a',
        borderRadius: '0 3px 3px 0',
        marginTop: '3px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }} />
    </div>
  )
}

function VideoModal({ lesson, pillarColor, onClose }: { lesson: Lesson; pillarColor: string; onClose: () => void }) {
  const hasVideo = !!lesson.videoId

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest font-bold mb-0.5" style={{ color: pillarColor }}>
              {lesson.free ? 'Free Lesson' : 'Member Lesson'}
            </p>
            <h3 className="font-bold text-text-primary text-sm leading-tight truncate">{lesson.title}</h3>
            <p className="text-text-muted text-xs mt-0.5">{lesson.duration}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-sm bevel-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {hasVideo ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: '3px', overflow: 'hidden', background: '#000' }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${lesson.videoId}?autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        ) : (
          <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: '3px', overflow: 'hidden', background: 'linear-gradient(160deg, #101310 0%, #141714 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Clock size={30} style={{ color: 'rgba(232,228,208,0.25)' }} />
              <div className="text-center">
                <p className="font-semibold text-sm" style={{ color: 'rgba(232,228,208,0.55)' }}>Coming soon</p>
                <p className="text-xs mt-1.5" style={{ color: 'rgba(232,228,208,0.28)' }}>This lesson video will be added shortly.</p>
              </div>
            </div>
          </div>
        )}

        {lesson.description && (
          <p className="mt-3 text-xs text-text-secondary leading-relaxed">{lesson.description}</p>
        )}
      </div>
    </div>
  )
}
