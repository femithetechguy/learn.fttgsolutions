'use client'

import { useState } from 'react'
import {
  BookOpen, Code2, Brain, Flame, PlayCircle, Clock, Lock,
  ChevronRight, Sparkles, TrendingUp
} from 'lucide-react'
import Nav from '@/components/Nav'
import content from '@/lib/content'
import coursesData from '@/lib/courses'

const PILLAR_ICONS = { 'App Dev': Code2, 'Data & BI': BookOpen, 'Philosophy': Flame, 'Crossover': Brain } as const

const COURSES = coursesData.map(c => {
  const pillar = content.pillars.find(p => p.label === c.pillar)
  return {
    ...c,
    featured: 'featured' in c ? c.featured : false,
    icon: PILLAR_ICONS[c.pillar as keyof typeof PILLAR_ICONS],
    pillarColor: pillar?.color ?? '#D4AF37',
    pillarBg: pillar?.bg ?? 'rgba(212,175,55,0.1)',
  }
})

const FILTER_PILLS = content.dashboard.filters
const { ui, upsell } = content.dashboard

export default function CoursesPage() {
  const [filter, setFilter] = useState('All')

  const filtered = COURSES.filter(c => {
    if (filter === 'All') return true
    if (filter === 'Free') return c.free
    return c.pillar === filter
  })

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">
      <Nav />

      <div className="overflow-x-hidden">
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 sm:w-[600px] h-64 sm:h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
            <div className="animate-fade-in">
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                {content.courses.title}
              </h1>
              <p className="font-sans text-text-secondary text-lg mt-3 max-w-xl">
                {content.courses.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="gold-line mx-8" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filter pills */}
          <div
            className="flex items-center gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {FILTER_PILLS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-sans text-xs font-semibold px-4 py-2 rounded-sm border transition-all duration-150 ${
                  filter === f
                    ? 'bg-gold text-bg-primary border-gold'
                    : 'border-white/10 text-text-secondary hover:border-gold/40 hover:text-text-primary'
                }`}
              >
                {f}
              </button>
            ))}
            <span className="font-sans text-text-muted text-xs ml-auto hidden sm:block">
              {filtered.length} {filtered.length !== 1 ? ui.coursePlural : ui.courseSingular}
            </span>
          </div>

          {/* Course grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(course => {
              const Icon = course.icon
              return (
                <div
                  key={course.id}
                  className={`card-dark p-5 flex flex-col gap-4 group transition-all duration-200 hover:border-white/10 relative ${
                    course.featured ? 'border border-gold/20 animate-glow-pulse' : 'border border-transparent hover:border-white/8'
                  }`}
                >
                  {course.featured && (
                    <div className="absolute -top-2.5 left-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold text-bg-primary text-[10px] font-bold tracking-wider uppercase rounded-sm">
                        <Sparkles size={8} /> {ui.featuredBadge}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0"
                      style={{ background: course.pillarBg }}
                    >
                      <Icon size={18} style={{ color: course.pillarColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-sans text-[10px] font-semibold tracking-widest uppercase" style={{ color: course.pillarColor }}>
                          {course.pillar}
                        </span>
                        {course.free ? (
                          <span className="tag-pill bg-accent-bi/10 text-accent-bi border border-accent-bi/20 text-[10px]">{ui.freeBadge}</span>
                        ) : (
                          <span className="tag-pill bg-gold-muted text-gold border border-gold-border text-[10px]">{ui.memberBadge}</span>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-text-primary text-base leading-snug">
                        {course.title}
                      </h3>
                    </div>
                  </div>

                  <p className="font-sans text-text-secondary text-sm leading-relaxed flex-1">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-3 font-sans text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <PlayCircle size={11} />
                      {course.lessons} {ui.lessonsSuffix}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp size={11} />
                      {course.level}
                    </span>
                  </div>

                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm font-sans text-sm font-semibold bg-gold/10 border border-gold/20 text-gold hover:bg-gold hover:text-bg-primary active:scale-95 transition-all duration-150"
                  >
                    {ui.startButton}
                    <ChevronRight size={14} />
                  </button>
                </div>
              )
            })}
          </div>

          {/* Guest upsell */}
          <div className="mt-10 p-6 card-dark border border-gold/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-display font-bold text-text-primary text-lg">{upsell.title}</h3>
              <p className="font-sans text-text-secondary text-sm mt-1">{upsell.description}</p>
            </div>
            <a href="/" className="btn-gold flex-shrink-0 text-sm">
              {upsell.cta}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
