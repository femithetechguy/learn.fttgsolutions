'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Clock, Link as LinkIcon, Check, SkipBack, SkipForward, ChevronDown, FileText, Download } from 'lucide-react'
import type { Lesson, CourseModule } from '@/types/course'
import { lessonToSlug } from '@/lib/lesson-slug'

interface Props {
  courseTitle: string
  pillarColor: string
  modules: CourseModule[]
  activeLesson: Lesson
  onSelect: (lesson: Lesson) => void
  onClose: () => void
}

/* ── Module tree — rendered in both desktop sidebar and mobile bottom list ── */
function ModuleTree({
  modules, activeLesson, expandedMods, pillarColor, activeItemRef, onToggle, onSelect,
}: {
  modules: CourseModule[]
  activeLesson: Lesson
  expandedMods: Set<string>
  pillarColor: string
  activeItemRef: React.RefObject<HTMLButtonElement>
  onToggle: (id: string) => void
  onSelect: (lesson: Lesson) => void
}) {
  return (
    <>
      {modules.map((mod) => {
        const isExpanded = expandedMods.has(mod.id)
        return (
          <div key={mod.id}>
            {/* Module header */}
            <button
              onClick={() => onToggle(mod.id)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-[0.7rem] font-semibold leading-snug" style={{ color: 'rgba(240,237,230,0.72)' }}>
                  {mod.title}
                </p>
                <p className="text-[0.6rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                  {mod.lessons.length} videos
                </p>
              </div>
              <ChevronDown
                size={13}
                className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                style={{ color: 'rgba(255,255,255,0.3)' }}
              />
            </button>

            {isExpanded && mod.lessons.map((lesson) => {
              const isActive = lesson.id === activeLesson.id
              return (
                <button
                  key={lesson.id}
                  ref={isActive ? activeItemRef : undefined}
                  onClick={() => onSelect(lesson)}
                  className="w-full min-w-0 flex items-start gap-2.5 pl-4 pr-3 py-2 text-left transition-colors"
                  style={{ background: isActive ? `${pillarColor}14` : undefined }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '' }}
                >
                  {/* Circle indicator */}
                  <div className="flex-shrink-0 mt-[3px]" style={{
                    width: '13px', height: '13px', borderRadius: '50%',
                    border: isActive ? `2px solid ${pillarColor}` : '1.5px solid rgba(255,255,255,0.22)',
                    background: isActive ? pillarColor : 'transparent',
                    boxShadow: isActive ? `0 0 6px ${pillarColor}55` : 'none',
                  }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.71rem] leading-snug line-clamp-2" style={{
                      color: isActive ? 'rgba(240,237,230,0.95)' : 'rgba(240,237,230,0.52)',
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {lesson.title}
                    </p>
                    <p className="text-[0.61rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.26)' }}>
                      {lesson.duration}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )
      })}
    </>
  )
}

/* ── Main modal ── */
export default function PlaylistModal({ courseTitle, pillarColor, modules, activeLesson, onSelect, onClose }: Props) {
  const activeItemRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)

  const allLessons = modules.flatMap(m => m.lessons)
  const activeIndex = allLessons.findIndex(l => l.id === activeLesson.id)
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < allLessons.length - 1

  // Default: expand the module that contains the active lesson
  const [expandedMods, setExpandedMods] = useState<Set<string>>(() => {
    const mod = modules.find(m => m.lessons.some(l => l.id === activeLesson.id))
    return new Set(mod ? [mod.id] : [])
  })

  // Auto-expand when active lesson changes (e.g. skip)
  useEffect(() => {
    const mod = modules.find(m => m.lessons.some(l => l.id === activeLesson.id))
    if (mod) setExpandedMods(prev => new Set(Array.from(prev).concat(mod.id)))
  }, [activeLesson.id])

  // URL sync
  useEffect(() => {
    window.history.replaceState({}, '', `${window.location.pathname}?v=${lessonToSlug(activeLesson.title)}`)
  }, [activeLesson.id])
  useEffect(() => () => { window.history.replaceState({}, '', window.location.pathname) }, [])

  // Scroll active item into sidebar
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeLesson.id])

  // Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function toggleMod(id: string) {
    setExpandedMods(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeModule = modules.find(m => m.lessons.some(l => l.id === activeLesson.id))

  const treeProps = { modules, activeLesson, expandedMods, pillarColor, activeItemRef, onToggle: toggleMod, onSelect }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#080808' }}>

      {/* ── Header ── */}
      <div
        className="flex items-center gap-2 px-4 flex-shrink-0"
        style={{ height: '52px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Course + lesson title */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: pillarColor }}>
            {courseTitle}
          </p>
          <p className="text-[0.78rem] font-semibold leading-tight truncate text-text-primary">
            {activeLesson.title}
          </p>
        </div>

        {/* Counter + skip + actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Counter — hidden on small screens to save space */}
          <span className="hidden sm:inline text-[11px] tabular-nums mr-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
            {activeIndex + 1}/{allLessons.length}
          </span>

          <button
            onClick={() => hasPrev && onSelect(allLessons[activeIndex - 1])}
            disabled={!hasPrev}
            title="Previous video"
            className="w-8 h-8 flex items-center justify-center rounded-sm bevel-sm transition-colors"
            style={{ color: hasPrev ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)', cursor: hasPrev ? 'pointer' : 'default' }}
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={() => hasNext && onSelect(allLessons[activeIndex + 1])}
            disabled={!hasNext}
            title="Next video"
            className="w-8 h-8 flex items-center justify-center rounded-sm bevel-sm transition-colors"
            style={{ color: hasNext ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)', cursor: hasNext ? 'pointer' : 'default' }}
          >
            <SkipForward size={14} />
          </button>

          {/* Copy link — hidden on small screens (use native browser share instead) */}
          <button
            onClick={copyLink}
            title="Copy shareable link"
            className="hidden sm:flex w-8 h-8 items-center justify-center rounded-sm bevel-sm transition-colors"
            style={{ color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)' }}
          >
            {copied ? <Check size={13} /> : <LinkIcon size={13} />}
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-sm bevel-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">

        {/* Desktop sidebar — LEFT, collapsible module tree */}
        <div
          className="hidden md:flex flex-col w-56 lg:w-64 flex-shrink-0 overflow-y-auto"
          style={{ borderRight: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a' }}
        >
          <div
            className="sticky top-0 z-10 px-4 py-2.5"
            style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Playlist · {allLessons.length} videos
            </p>
          </div>
          <ModuleTree {...treeProps} />
        </div>

        {/* Main content — module intro + video + transcript (scrolls as one) */}
        <div className="flex-1 min-w-0 overflow-y-auto">

          {/* Module intro banner */}
          {activeModule?.description && (
            <div className="px-5 sm:px-7 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[9px] uppercase tracking-widest font-semibold mb-1.5" style={{ color: pillarColor }}>
                {activeModule.title}
              </p>
              <p className="text-[0.78rem] leading-relaxed" style={{ color: 'rgba(240,237,230,0.52)' }}>
                {activeModule.description}
              </p>

              {/* Downloads — only rendered when hasDownloads is true and downloads exist */}
              {activeModule.hasDownloads && activeModule.downloads && activeModule.downloads.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Download size={10} style={{ color: 'rgba(255,255,255,0.28)' }} />
                    <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      Resources
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {activeModule.downloads.map((dl, i) => (
                      <a
                        key={i}
                        href={dl.url}
                        download
                        className="flex items-center gap-3 px-3 py-2.5 rounded transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      >
                        <Download size={13} style={{ color: pillarColor, flexShrink: 0 }} />
                        <span className="flex-1 text-[0.78rem]" style={{ color: 'rgba(240,237,230,0.8)' }}>{dl.name}</span>
                        {dl.size && (
                          <span className="text-[0.68rem] tabular-nums flex-shrink-0" style={{ color: 'rgba(255,255,255,0.28)' }}>{dl.size}</span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Video — natural 16:9, no forced full-height */}
          <div className="w-full bg-black aspect-video">
            {activeLesson.videoId ? (
              <iframe
                key={activeLesson.videoId}
                src={`https://www.youtube-nocookie.com/embed/${activeLesson.videoId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
                style={{ border: 'none', display: 'block' }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3"
                style={{ background: 'linear-gradient(160deg, #101310 0%, #141714 100%)' }}>
                <Clock size={32} style={{ color: 'rgba(232,228,208,0.22)' }} />
                <p className="text-sm font-semibold" style={{ color: 'rgba(232,228,208,0.5)' }}>Coming soon</p>
              </div>
            )}
          </div>

          {/* Lesson info + transcript */}
          <div className="px-5 sm:px-7 py-5 max-w-3xl">
            <h2 className="text-[1rem] font-bold text-text-primary leading-snug mb-1">
              {activeLesson.title}
            </h2>
            <p className="text-[0.7rem] mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {activeLesson.duration}
            </p>

            <div className="flex items-center gap-1.5 mb-2">
              <FileText size={10} style={{ color: 'rgba(255,255,255,0.28)' }} />
              <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {activeLesson.transcript ? 'Transcript' : 'Notes'}
              </p>
            </div>

            {activeLesson.transcript ? (
              <p className="text-[0.8rem] leading-relaxed" style={{ color: 'rgba(240,237,230,0.58)' }}>
                {activeLesson.transcript}
              </p>
            ) : activeLesson.description ? (
              <p className="text-[0.8rem] leading-relaxed" style={{ color: 'rgba(240,237,230,0.5)' }}>
                {activeLesson.description}
              </p>
            ) : (
              <p className="text-[0.75rem]" style={{ color: 'rgba(255,255,255,0.18)' }}>
                Transcript and notes coming soon.
              </p>
            )}
          </div>

          {/* Mobile module list — below the content */}
          <div
            className="md:hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div
              className="px-4 py-2.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: '#080808' }}
            >
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.28)' }}>
                Playlist · {allLessons.length} videos
              </p>
            </div>
            <ModuleTree {...treeProps} />
          </div>

        </div>
      </div>
    </div>
  )
}
