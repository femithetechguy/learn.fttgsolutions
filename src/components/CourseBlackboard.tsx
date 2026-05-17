'use client'

import { useState } from 'react'
import { Link as LinkIcon, Check } from 'lucide-react'
import Blackboard, { CHALK, chalkColor, chalkGlow } from './Blackboard'
import PlaylistModal from './PlaylistModal'
import type { CourseDetail, CourseModule, Lesson } from '@/types/course'

// Re-export for the server page import
export type { CourseDetail } from '@/types/course'

function ModuleShareButton({ modId }: { modId: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    const url = `${window.location.origin}${window.location.pathname}?m=${modId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={e => { e.stopPropagation(); copy() }}
      title="Copy link to this module"
      className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded transition-opacity opacity-0 group-hover:opacity-100"
      style={{ color: copied ? '#4ade80' : chalkColor(0.45) }}
    >
      {copied ? <Check size={11} /> : <LinkIcon size={11} />}
    </button>
  )
}

export default function CourseBlackboard({
  course,
  initialLesson = null,
  initialModule = null,
}: {
  course: CourseDetail
  initialLesson?: Lesson | null
  initialModule?: CourseModule | null
}) {
  // If a module is deep-linked, open on its first lesson but show the overview
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    initialLesson ?? (initialModule ? initialModule.lessons[0] : null)
  )
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
              <div className="flex items-center gap-2 mb-0.5 group">
                <p className="flex-1 text-[10px] uppercase tracking-[0.18em]"
                  style={{
                    color: chalkColor(0.38),
                    textDecoration: 'underline',
                    textDecorationColor: chalkColor(0.16),
                    textUnderlineOffset: '3px',
                  }}>
                  Module {mi + 1}
                </p>
                <ModuleShareButton modId={mod.id} />
              </div>
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
        <PlaylistModal
          courseTitle={course.title}
          pillarColor={course.pillarColor}
          modules={course.modules}
          activeLesson={activeLesson}
          initialIntroModId={initialModule?.id ?? null}
          onSelect={setActiveLesson}
          onClose={() => setActiveLesson(null)}
        />
      )}
    </>
  )
}
