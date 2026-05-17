'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Clock, Link as LinkIcon, Check, SkipBack, SkipForward, ChevronDown, FileText, Download, BookOpen } from 'lucide-react'
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
  modules, activeLesson, activeIntroModId, expandedMods, pillarColor,
  activeItemRef, onToggle, onSelect, onSelectIntro,
}: {
  modules: CourseModule[]
  activeLesson: Lesson
  activeIntroModId: string | null
  expandedMods: Set<string>
  pillarColor: string
  activeItemRef: React.RefObject<HTMLButtonElement>
  onToggle: (id: string) => void
  onSelect: (lesson: Lesson) => void
  onSelectIntro: (modId: string) => void
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

            {isExpanded && (
              <>
                {/* Overview item — always first */}
                {(() => {
                  const isActive = activeIntroModId === mod.id
                  return (
                    <button
                      onClick={() => onSelectIntro(mod.id)}
                      className="w-full min-w-0 flex items-start gap-2.5 pl-4 pr-3 py-2 text-left transition-colors"
                      style={{ background: isActive ? `${pillarColor}14` : undefined }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '' }}
                    >
                      <BookOpen
                        size={11}
                        className="flex-shrink-0 mt-[3px]"
                        style={{ color: isActive ? pillarColor : 'rgba(255,255,255,0.3)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.71rem] leading-snug" style={{
                          color: isActive ? 'rgba(240,237,230,0.95)' : 'rgba(240,237,230,0.45)',
                          fontWeight: isActive ? 600 : 400,
                        }}>
                          Overview
                        </p>
                        {mod.hasDownloads && mod.downloads && mod.downloads.length > 0 && (
                          <p className="text-[0.61rem] mt-0.5" style={{ color: 'rgba(255,255,255,0.26)' }}>
                            {mod.downloads.length} resource{mod.downloads.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </button>
                  )
                })()}

                {/* Lesson items */}
                {mod.lessons.map((lesson) => {
                  const isActive = lesson.id === activeLesson.id && activeIntroModId === null
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
              </>
            )}
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
  // null = viewing a lesson; module id = viewing that module's intro/overview
  const [activeIntroModId, setActiveIntroModId] = useState<string | null>(null)

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

  // URL sync — only for lessons, not intro pages
  useEffect(() => {
    if (activeIntroModId) return
    window.history.replaceState({}, '', `${window.location.pathname}?v=${lessonToSlug(activeLesson.title)}`)
  }, [activeLesson.id, activeIntroModId])
  useEffect(() => () => { window.history.replaceState({}, '', window.location.pathname) }, [])

  // Scroll active item into sidebar
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [activeLesson.id, activeIntroModId])

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

  function handleSelectLesson(lesson: Lesson) {
    setActiveIntroModId(null)
    onSelect(lesson)
  }

  function handleSelectIntro(modId: string) {
    setActiveIntroModId(modId)
    // Expand the module if not already open
    setExpandedMods(prev => new Set(Array.from(prev).concat(modId)))
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const introModule = activeIntroModId ? modules.find(m => m.id === activeIntroModId) : null

  const treeProps = {
    modules, activeLesson, activeIntroModId, expandedMods, pillarColor,
    activeItemRef, onToggle: toggleMod, onSelect: handleSelectLesson, onSelectIntro: handleSelectIntro,
  }

  // Header title: module name when on overview, lesson title otherwise
  const headerTitle = introModule ? introModule.title : activeLesson.title

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#080808' }}>

      {/* ── Header ── */}
      <div
        className="flex items-center gap-2 px-4 flex-shrink-0"
        style={{ height: '52px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Course + lesson/module title */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: pillarColor }}>
            {courseTitle}
          </p>
          <p className="text-[0.78rem] font-semibold leading-tight truncate text-text-primary">
            {headerTitle}
          </p>
        </div>

        {/* Counter + skip + actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Counter — hidden on small screens or when viewing intro */}
          {!introModule && (
            <span className="hidden sm:inline text-[11px] tabular-nums mr-1" style={{ color: 'rgba(255,255,255,0.28)' }}>
              {activeIndex + 1}/{allLessons.length}
            </span>
          )}

          <button
            onClick={() => hasPrev && !introModule && onSelect(allLessons[activeIndex - 1])}
            disabled={!hasPrev || !!introModule}
            title="Previous video"
            className="w-8 h-8 flex items-center justify-center rounded-sm bevel-sm transition-colors"
            style={{ color: hasPrev && !introModule ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)', cursor: hasPrev && !introModule ? 'pointer' : 'default' }}
          >
            <SkipBack size={14} />
          </button>
          <button
            onClick={() => hasNext && !introModule && onSelect(allLessons[activeIndex + 1])}
            disabled={!hasNext || !!introModule}
            title="Next video"
            className="w-8 h-8 flex items-center justify-center rounded-sm bevel-sm transition-colors"
            style={{ color: hasNext && !introModule ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)', cursor: hasNext && !introModule ? 'pointer' : 'default' }}
          >
            <SkipForward size={14} />
          </button>

          {/* Copy link — hidden on small screens or when viewing intro */}
          {!introModule && (
            <button
              onClick={copyLink}
              title="Copy shareable link"
              className="hidden sm:flex w-8 h-8 items-center justify-center rounded-sm bevel-sm transition-colors"
              style={{ color: copied ? '#4ade80' : 'rgba(255,255,255,0.4)' }}
            >
              {copied ? <Check size={13} /> : <LinkIcon size={13} />}
            </button>
          )}
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

        {/* Desktop sidebar */}
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

        {/* Main content — scrolls as one column */}
        <div className="flex-1 min-w-0 overflow-y-auto">

          {introModule ? (
            /* ── Overview / intro view ── */
            <div className="px-5 sm:px-7 py-7 max-w-3xl">
              <h2 className="text-[1.05rem] font-bold text-text-primary leading-snug mb-4">
                {introModule.title}
              </h2>
              <p className="text-[0.82rem] leading-relaxed" style={{ color: 'rgba(240,237,230,0.62)' }}>
                {introModule.description}
              </p>

              {/* Downloads */}
              {introModule.hasDownloads && introModule.downloads && introModule.downloads.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Download size={10} style={{ color: 'rgba(255,255,255,0.28)' }} />
                    <p className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.28)' }}>
                      Resources
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {introModule.downloads.map((dl, i) => (
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
          ) : (
            /* ── Lesson / video view ── */
            <>
              {/* Video — natural 16:9 */}
              <div className="w-full bg-black aspect-video relative">
                {activeLesson.videoId ? (
                  <>
                    <iframe
                      key={activeLesson.videoId}
                      src={`https://www.youtube-nocookie.com/embed/${activeLesson.videoId}?autoplay=1&rel=0&iv_load_policy=3&modestbranding=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                      style={{ border: 'none', display: 'block' }}
                    />
                    {/* End-screen card zones (above control bar) */}
                    <div className="absolute left-0 w-[32%]" style={{ bottom: '11%', height: '22%', zIndex: 1 }} />
                    <div className="absolute right-0 w-[38%]" style={{ bottom: '11%', height: '22%', zIndex: 1 }} />
                    {/* Control bar — covers everything LEFT of the settings/CC/fullscreen strip (~rightmost 32%) */}
                    <div className="absolute bottom-0 left-0 w-[68%] h-[11%]" style={{ zIndex: 1 }} />
                    {/* YouTube logo + link icon slot in control bar (~right 7–30%, between fullscreen and settings) */}
                    <div className="absolute bottom-0 w-[23%]" style={{ right: '7%', height: '11%', zIndex: 1 }} />
                  </>
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
            </>
          )}

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
