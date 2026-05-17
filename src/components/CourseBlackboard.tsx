'use client'

import { useState } from 'react'
import { Play, Clock, Lock, X } from 'lucide-react'

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

const CHALK_COLORS = ['#f0ede6', '#f5e47a', '#7ccfb5', '#f48fb1', '#90caf9', '#ef9a9a', '#ffcc80']
const CHALK_ROTATIONS = [-8, -4, 2, -6, 3, -2, 5]

export default function CourseBlackboard({ course }: { course: CourseDetail }) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)

  return (
    <>
      {/* Wooden frame */}
      <div
        className="w-full rounded-sm relative select-none"
        style={{
          background: 'linear-gradient(160deg, #5c3010 0%, #7a4218 20%, #6b3a15 55%, #4a2c0a 100%)',
          padding: '14px 14px 0',
          boxShadow: [
            '0 16px 56px rgba(0,0,0,0.8)',
            '0 4px 16px rgba(0,0,0,0.5)',
            'inset 0 1px 0 rgba(255,255,255,0.09)',
            'inset 0 -2px 4px rgba(0,0,0,0.6)',
            'inset 1px 0 0 rgba(255,255,255,0.05)',
            'inset -1px 0 0 rgba(0,0,0,0.4)',
          ].join(','),
        }}
      >
        {/* Corner screws */}
        <Screw className="absolute top-3.5 left-3.5" />
        <Screw className="absolute top-3.5 right-3.5" />

        {/* Board surface */}
        <div
          className="w-full relative overflow-hidden"
          style={{
            minHeight: '500px',
            background: 'linear-gradient(160deg, #163222 0%, #1e3d2e 30%, #1b3829 65%, #12291e 100%)',
            borderRadius: '2px',
            boxShadow: [
              'inset 0 2px 10px rgba(0,0,0,0.6)',
              'inset 0 0 80px rgba(0,0,0,0.25)',
            ].join(','),
          }}
        >
          {/* Chalk-dust erased smear overlays */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: [
                'radial-gradient(ellipse 220px 90px at 12% 22%, rgba(255,255,255,0.016) 0%, transparent 100%)',
                'radial-gradient(ellipse 160px 60px at 72% 58%, rgba(255,255,255,0.011) 0%, transparent 100%)',
                'radial-gradient(ellipse 120px 50px at 48% 82%, rgba(255,255,255,0.009) 0%, transparent 100%)',
                'radial-gradient(ellipse 80px 30px at 88% 18%, rgba(255,255,255,0.013) 0%, transparent 100%)',
              ].join(','),
            }}
          />

          <div className="relative z-10 p-5 sm:p-8">

            {/* Course header */}
            <div className="mb-7 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <p
                className="text-[10px] uppercase tracking-[0.22em] font-bold mb-1"
                style={{
                  color: course.pillarColor,
                  textShadow: `0 0 12px ${course.pillarColor}60`,
                }}
              >
                {course.pillarLabel} · {course.level} · {course.totalDuration}
              </p>
              <h1
                className="text-xl sm:text-2xl font-bold leading-tight"
                style={{
                  color: '#f0ede6',
                  textShadow: '0 0 18px rgba(240,237,230,0.22), 1px 1px 3px rgba(0,0,0,0.95)',
                  letterSpacing: '0.01em',
                }}
              >
                {course.title}
              </h1>
              <p
                className="mt-1.5 text-sm leading-relaxed"
                style={{
                  color: 'rgba(240,237,230,0.42)',
                  textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                }}
              >
                {course.subtitle}
              </p>
              <p className="mt-2 text-[11px]" style={{ color: 'rgba(240,237,230,0.28)' }}>
                {course.modules.length} modules · {totalLessons} lessons
              </p>
            </div>

            {/* Modules */}
            <div className="space-y-9">
              {course.modules.map((mod, mi) => (
                <div key={mod.id}>
                  {/* Module label */}
                  <div className="mb-3">
                    <p className="text-[9px] uppercase tracking-[0.2em] mb-0.5" style={{ color: 'rgba(240,237,230,0.32)' }}>
                      Module {mi + 1}
                    </p>
                    <h2
                      className="text-sm font-bold"
                      style={{
                        color: '#dedad0',
                        textShadow: '0 0 8px rgba(240,237,230,0.18)',
                      }}
                    >
                      {mod.title}
                    </h2>
                    {/* Chalk underline */}
                    <div
                      style={{
                        marginTop: '5px',
                        height: '1.5px',
                        width: '90px',
                        background: 'rgba(240,237,230,0.16)',
                        borderRadius: '1px',
                      }}
                    />
                  </div>

                  {/* Lesson cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                    {mod.lessons.map((lesson, li) => {
                      const hasVideo = !!lesson.videoId
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => setActiveLesson(lesson)}
                          className="lesson-card text-left"
                        >
                          <div className="flex items-start gap-2.5 p-3">
                            <div className="mt-0.5 flex-shrink-0">
                              {hasVideo && lesson.free ? (
                                <Play
                                  size={11}
                                  fill={course.pillarColor}
                                  style={{ color: course.pillarColor }}
                                />
                              ) : hasVideo ? (
                                <Lock size={11} style={{ color: 'rgba(240,237,230,0.28)' }} />
                              ) : (
                                <Clock size={11} style={{ color: 'rgba(240,237,230,0.22)' }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-[11px] font-semibold leading-snug"
                                style={{
                                  color: hasVideo ? '#e8e4d4' : 'rgba(240,237,230,0.38)',
                                  textShadow: hasVideo ? '0 0 6px rgba(240,237,230,0.1)' : 'none',
                                }}
                              >
                                {li + 1}. {lesson.title}
                              </p>
                              <p className="text-[10px] mt-1" style={{ color: 'rgba(240,237,230,0.28)' }}>
                                {lesson.duration}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Chalk tray */}
        <div
          className="relative flex items-center"
          style={{
            height: '40px',
            background: 'linear-gradient(180deg, #6b3a14 0%, #4e2c0e 55%, #3a2008 100%)',
            borderTop: '3px solid rgba(0,0,0,0.55)',
            borderRadius: '0 0 3px 3px',
            boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04)',
            paddingLeft: '22px',
            gap: '8px',
          }}
        >
          {/* Tray ledge shadow line */}
          <div
            className="absolute"
            style={{
              top: '8px',
              left: '8px',
              right: '8px',
              height: '1.5px',
              background: 'linear-gradient(90deg, transparent, rgba(240,237,230,0.07) 15%, rgba(240,237,230,0.05) 85%, transparent)',
            }}
          />

          {/* Bottom corner screws */}
          <Screw className="absolute bottom-2.5 left-3.5" />
          <Screw className="absolute bottom-2.5 right-3.5" />

          {/* Chalk pieces */}
          {CHALK_COLORS.map((color, i) => (
            <div
              key={i}
              style={{
                width: '24px',
                height: '9px',
                borderRadius: '3px',
                background: `linear-gradient(155deg, ${color}f2 0%, ${color}a8 50%, ${color}c4 100%)`,
                transform: `rotate(${CHALK_ROTATIONS[i]}deg)`,
                boxShadow: `0 2px 5px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(0,0,0,0.25)`,
                flexShrink: 0,
              }}
            />
          ))}

          {/* Chalk dust smudge */}
          <div style={{ marginLeft: '6px', opacity: 0.55 }}>
            <div
              style={{
                width: '18px',
                height: '4px',
                borderRadius: '9px',
                background: 'rgba(240,237,230,0.22)',
                filter: 'blur(3px)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Video modal */}
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

function Screw({ className }: { className: string }) {
  return (
    <div
      className={`${className} w-3 h-3 rounded-full z-20 flex items-center justify-center`}
      style={{
        background: 'radial-gradient(circle at 35% 30%, #9a8a78, #3c2c1c)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div
        style={{
          width: '55%',
          height: '1.5px',
          background: 'rgba(0,0,0,0.55)',
          borderRadius: '1px',
          transform: 'rotate(45deg)',
        }}
      />
    </div>
  )
}

function VideoModal({
  lesson,
  pillarColor,
  onClose,
}: {
  lesson: Lesson
  pillarColor: string
  onClose: () => void
}) {
  const hasVideo = !!lesson.videoId

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.90)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] uppercase tracking-widest font-bold mb-0.5"
              style={{ color: pillarColor }}
            >
              {lesson.free ? 'Free Lesson' : 'Member Lesson'}
            </p>
            <h3 className="font-bold text-text-primary text-sm leading-tight truncate">
              {lesson.title}
            </h3>
            <p className="text-text-muted text-xs mt-0.5">{lesson.duration}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-sm bevel-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Video or coming soon */}
        {hasVideo ? (
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              borderRadius: '3px',
              overflow: 'hidden',
              background: '#000',
            }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${lesson.videoId}?autoplay=1&rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              paddingBottom: '56.25%',
              borderRadius: '3px',
              overflow: 'hidden',
              background: 'linear-gradient(160deg, #163222 0%, #1e3d2e 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <Clock size={30} style={{ color: 'rgba(240,237,230,0.25)' }} />
              <div className="text-center">
                <p
                  className="font-semibold text-sm"
                  style={{ color: 'rgba(240,237,230,0.55)' }}
                >
                  Coming soon
                </p>
                <p
                  className="text-xs mt-1.5"
                  style={{ color: 'rgba(240,237,230,0.28)' }}
                >
                  This lesson video will be added shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {lesson.description && (
          <p className="mt-3 text-xs text-text-secondary leading-relaxed">
            {lesson.description}
          </p>
        )}
      </div>
    </div>
  )
}
