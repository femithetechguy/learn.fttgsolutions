'use client'

import { useState } from 'react'
import {
  BookOpen, Code2, Brain, Flame, PlayCircle, Clock, Lock,
  ChevronRight, Sparkles, TrendingUp, Users, Star,
  Youtube, Instagram, Twitter, Send
} from 'lucide-react'
import Nav from '@/components/Nav'
import Logo from '@/components/Logo'
import content from '@/lib/content'
import coursesData from '@/lib/courses'

interface DashboardProps {
  user: { name?: string; email?: string; role: 'member' | 'guest' | null }
  onLogout: () => void
}

const PILLAR_ICONS = { 'App Dev': Code2, 'Data & BI': BookOpen, 'Philosophy': Flame, 'Crossover': Brain } as const
const STAT_ICONS = [PlayCircle, Clock, Users, Star]

const COURSES = coursesData.map(c => {
  const pillar = content.pillars.find(p => p.label === c.pillar)
  return {
    ...c,
    progress: 0,
    featured: 'featured' in c ? c.featured : false,
    icon: PILLAR_ICONS[c.pillar as keyof typeof PILLAR_ICONS],
    pillarColor: pillar?.color ?? '#D4AF37',
    pillarBg: pillar?.bg ?? 'rgba(212,175,55,0.1)',
  }
})

const STATS = content.dashboard.stats.map((s, i) => ({ ...s, icon: STAT_ICONS[i] }))

const FILTER_PILLS = content.dashboard.filters
const { ui, hero, upsell } = content.dashboard

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [filter, setFilter] = useState('All')

  const isGuest = user.role === 'guest'
  const displayName = user.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : ui.defaultLearnerName

  const filtered = COURSES.filter(c => {
    if (filter === 'All') return true
    if (filter === 'Free') return c.free
    return c.pillar === filter
  })

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">

      <Nav user={user} onLogout={onLogout} />

      {/* overflow-x-hidden here (not on outer div) so sticky nav isn't broken */}
      <div className="overflow-x-hidden">

      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 sm:w-[600px] h-64 sm:h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
          <div className="animate-fade-in">
            {isGuest ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-muted border border-gold-border rounded-sm mb-4 max-w-full">
                  <Sparkles size={12} className="text-gold flex-shrink-0" />
                  <span className="font-sans text-xs font-semibold text-gold tracking-wide">{hero.guestBadge}</span>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                  {hero.guestTitle}
                </h1>
              </>
            ) : (
              <>
                <p className="font-sans text-text-muted text-sm tracking-widest uppercase mb-2">{hero.memberGreetingLabel}</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                  Hey, {displayName} 👋
                </h1>
              </>
            )}
            <p className="font-sans text-text-secondary text-lg mt-3 max-w-xl">
              {hero.subtitle}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 animate-slide-up animate-delay-200">
            {STATS.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="card-dark p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
                  <Icon size={15} style={{ color }} />
                </div>
                <div>
                  <p className="font-display font-bold text-xl text-text-primary leading-none">{value}</p>
                  <p className="font-sans text-text-muted text-xs mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div className="gold-line mx-8" />

      {/* Courses section */}
      <div id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}>
          {FILTER_PILLS.map(f => (
            <button
              key={f.label}
              onClick={() => setFilter(f.label)}
              className={`font-sans text-xs font-semibold px-4 py-2 rounded-sm border transition-all duration-150 ${
                filter === f.label
                  ? 'bg-gold text-bg-primary border-gold'
                  : 'border-white/10 text-text-secondary hover:border-gold/40 hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="font-sans text-text-muted text-xs ml-auto hidden sm:block">
            {filtered.length} {filtered.length !== 1 ? ui.coursePlural : ui.courseSingular}
          </span>
        </div>

        {/* Course grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((course) => {
            const Icon = course.icon
            const locked = !course.free && isGuest

            return (
              <div
                key={course.id}
                className={`card-dark p-5 flex flex-col gap-4 group transition-all duration-200 hover:border-white/10 relative ${
                  course.featured ? 'border border-gold/20 animate-glow-pulse' : 'border border-transparent hover:border-white/8'
                }`}
              >
                {/* Featured badge */}
                {course.featured && (
                  <div className="absolute -top-2.5 left-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gold text-bg-primary text-[10px] font-bold tracking-wider uppercase rounded-sm">
                      <Sparkles size={8} /> {ui.featuredBadge}
                    </span>
                  </div>
                )}

                {/* Header */}
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

                {/* Description */}
                <p className="font-sans text-text-secondary text-sm leading-relaxed flex-1">
                  {course.description}
                </p>

                {/* Meta */}
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

                {/* CTA */}
                <button
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-sm font-sans text-sm font-semibold transition-all duration-150 ${
                    locked
                      ? 'bg-bg-elevated border border-white/5 text-text-muted cursor-not-allowed'
                      : 'bg-gold/10 border border-gold/20 text-gold hover:bg-gold hover:text-bg-primary active:scale-95'
                  }`}
                  disabled={locked}
                >
                  {locked ? (
                    <>
                      <Lock size={14} />
                      {ui.lockedButton}
                    </>
                  ) : (
                    <>
                      {ui.startButton}
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Guest upsell */}
        {isGuest && (
          <div className="mt-10 p-6 card-dark border border-gold/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-display font-bold text-text-primary text-lg">{upsell.title}</h3>
              <p className="font-sans text-text-secondary text-sm mt-1">{upsell.description}</p>
            </div>
            <button className="btn-gold flex-shrink-0 text-sm">
              {upsell.cta} <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Top grid — 1 col mobile, 2 col tablet, 4 col desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>

            {/* Brand */}
            <div className="flex flex-col gap-3">
              <Logo size="sm" />
              <p className="font-sans text-text-muted text-sm leading-relaxed">
                {content.footer.brand.tagline}
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-2.5">
              <p className="font-sans text-sm font-semibold text-text-primary mb-1">{content.footer.quickLinks.heading}</p>
              {content.footer.quickLinks.links.map(l => (
                <a key={l.label} href={l.href} className="font-sans text-sm text-text-muted hover:text-text-primary transition-colors" {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {l.label}
                </a>
              ))}
            </div>

            {/* Company */}
            <div className="flex flex-col gap-2.5">
              <p className="font-sans text-sm font-semibold text-text-primary mb-1">{content.footer.company.heading}</p>
              {content.footer.company.links.map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="font-sans text-sm text-text-muted hover:text-text-primary transition-colors">
                  {l.label}
                </a>
              ))}
            </div>

            {/* Newsletter */}
            <div className="flex flex-col gap-2.5">
              <p className="font-sans text-sm font-semibold text-text-primary mb-1">{content.footer.newsletter.heading}</p>
              <p className="font-sans text-sm text-text-muted">{content.footer.newsletter.description}</p>
              <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-2 mt-1">
                <input type="email" placeholder={content.footer.newsletter.placeholder} className="input-dark text-sm py-2" />
                <button type="submit" className="btn-gold text-sm py-2 gap-2">
                  <Send size={13} />
                  {content.footer.newsletter.button}
                </button>
              </form>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 pb-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-sans text-text-secondary text-xs">{content.footer.copyright}</p>
            <div className="flex items-center gap-8 shrink-0">
              <a href={content.footer.social.youtube} target="_blank" rel="noopener noreferrer" aria-label={content.footer.social.youtubeLabel} className="text-text-secondary hover:text-gold transition-colors">
                <Youtube size={20} />
              </a>
              <a href={content.footer.social.instagram} target="_blank" rel="noopener noreferrer" aria-label={content.footer.social.instagramLabel} className="text-text-secondary hover:text-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href={content.footer.social.twitter} target="_blank" rel="noopener noreferrer" aria-label={content.footer.social.twitterLabel} className="text-text-secondary hover:text-gold transition-colors">
                <Twitter size={20} />
              </a>
            </div>
          </div>

        </div>
      </footer>
      </div>{/* end overflow-x-hidden wrapper */}
    </div>
  )
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}
