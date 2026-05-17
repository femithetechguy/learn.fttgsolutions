'use client'

import { useState } from 'react'
import { X, Clock } from 'lucide-react'
import Blackboard, { CHALK, chalkColor, chalkGlow } from './Blackboard'

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

export default function CourseBlackboard({ course }: { course: CourseDetail }) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const total = course.modules.reduce((s, m) => s + m.lessons.length, 0)

  return (
    <>
      <Blackboard>
        {/* Course header */}
        <p className="text-[11px] uppercase tracking-[0.18em] mb-2"
          style={{ color: course.pillarColor, textShadow: `0 0 10px ${course.pillarColor}55` }}>
          {course.pillarLabel} – {course.level} · {course.totalDuration}
        </p>

        <div>
          <h1 className="text-[1.85rem] sm:text-[2.1rem] leading-tight"
            style={{ color: chalkColor(0.93), textShadow: chalkGlow(0.22), letterSpacing: '0.01em' }}>
            {course.title}
          </h1>
          <div style={{
            height: '1.5px', marginTop: '5px', marginBottom: '10px', width: '100%',
            background: 'linear-gradient(90deg, rgba(232,228,208,0.35) 0%, rgba(232,228,208,0.18) 75%, transparent 100%)',
            borderRadius: '1px',
          }} />
        </div>

        <p className="text-[0.8rem] leading-relaxed mb-1.5" style={{ color: chalkColor(0.5), textShadow: chalkGlow(0.06) }}>
          {course.subtitle}
        </p>
        <p className="text-[0.72rem] mb-5" style={{ color: chalkColor(0.35) }}>
          {course.modules.length} modules · {total} lessons
        </p>

        {/* Chalk divider */}
        <div style={{
          height: '1px', marginBottom: '20px',
          background: 'linear-gradient(90deg, transparent, rgba(232,228,208,0.2) 12%, rgba(232,228,208,0.16) 88%, transparent)',
        }} />

        {/* Modules */}
        <div className="space-y-8">
          {course.modules.map((mod, mi) => (
            <div key={mod.id}>
              <p className="text-[10px] uppercase tracking-[0.18em] mb-0.5"
                style={{
                  color: chalkColor(0.38),
                  textDecoration: 'underline',
                  textDecorationColor: chalkColor(0.16),
                  textUnderlineOffset: '3px',
                }}>
                Module {mi + 1}
              </p>
              <h2 className="text-[1.02rem] mb-3" style={{ color: chalkColor(0.83), textShadow: chalkGlow(0.1) }}>
                {mod.title}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mod.lessons.map((lesson, li) => (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className="chalk-card text-left"
                    style={{ fontFamily: CHALK }}
                  >
                    <div className="flex items-start gap-3 p-3 sm:p-3.5">
                      <div className="flex-shrink-0 flex items-center justify-center" style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        border: `1.5px solid ${chalkColor(lesson.videoId ? 0.48 : 0.24)}`,
                        fontSize: '11px',
                        color: chalkColor(lesson.videoId ? 0.72 : 0.32),
                        lineHeight: 1, marginTop: '1px',
                      }}>
                        {li + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.78rem] leading-snug" style={{
                          color: chalkColor(lesson.videoId ? 0.88 : 0.4),
                          textShadow: lesson.videoId ? chalkGlow(0.09) : 'none',
                        }}>
                          {lesson.title}
                        </p>
                        <p className="text-[0.68rem] mt-1" style={{ color: chalkColor(0.3) }}>
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
      </Blackboard>

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
