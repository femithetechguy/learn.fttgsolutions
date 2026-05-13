'use client'

import { useState } from 'react'
import {
  BookOpen, Code2, Brain, Flame, PlayCircle, Clock, Lock,
  LogOut, Menu, X, ChevronRight, Sparkles, TrendingUp, Users, Star
} from 'lucide-react'
import Logo from '@/components/Logo'

interface DashboardProps {
  user: { name?: string; email?: string; role: 'member' | 'guest' | null }
  onLogout: () => void
}

const COURSES = [
  {
    id: 1,
    title: 'DAX Zero to Advanced',
    description: 'From SUM to TREATAS — real enterprise patterns from production dashboards.',
    pillar: 'Data & BI',
    pillarColor: '#1D9E75',
    pillarBg: 'rgba(29,158,117,0.1)',
    icon: BookOpen,
    lessons: 12,
    duration: '4h 20m',
    level: 'Intermediate',
    free: true,
    progress: 0,
    featured: true,
  },
  {
    id: 2,
    title: 'Python ETL for Power BI',
    description: 'Replace Power Query with pandas. SharePoint via Microsoft Graph API.',
    pillar: 'Data & BI',
    pillarColor: '#1D9E75',
    pillarBg: 'rgba(29,158,117,0.1)',
    icon: BookOpen,
    lessons: 8,
    duration: '3h 10m',
    level: 'Advanced',
    free: false,
    progress: 0,
  },
  {
    id: 3,
    title: 'Next.js Personal Brand Site',
    description: 'Build your dev identity: dark aesthetic, React Three Fiber, Framer Motion.',
    pillar: 'App Dev',
    pillarColor: '#378ADD',
    pillarBg: 'rgba(55,138,221,0.1)',
    icon: Code2,
    lessons: 10,
    duration: '5h 00m',
    level: 'Intermediate',
    free: true,
    progress: 0,
  },
  {
    id: 4,
    title: 'NestJS API Architecture',
    description: 'Guards, Prisma, PostgreSQL/Neon. The backend stack that runs FTTG projects.',
    pillar: 'App Dev',
    pillarColor: '#378ADD',
    pillarBg: 'rgba(55,138,221,0.1)',
    icon: Code2,
    lessons: 9,
    duration: '3h 45m',
    level: 'Advanced',
    free: false,
    progress: 0,
  },
  {
    id: 5,
    title: 'The Builder\'s Philosophy',
    description: 'Jim Rohn, Napoleon Hill, Earl Nightingale — applied to the life of a builder.',
    pillar: 'Philosophy',
    pillarColor: '#EF9F27',
    pillarBg: 'rgba(239,159,39,0.1)',
    icon: Flame,
    lessons: 6,
    duration: '2h 00m',
    level: 'All levels',
    free: true,
    progress: 0,
  },
  {
    id: 6,
    title: 'Think & Build Rich — Napoleon Hill',
    description: 'Chapter-by-chapter walk through Think and Grow Rich for modern builders.',
    pillar: 'Philosophy',
    pillarColor: '#EF9F27',
    pillarBg: 'rgba(239,159,39,0.1)',
    icon: Flame,
    lessons: 14,
    duration: '6h 30m',
    level: 'All levels',
    free: false,
    progress: 0,
  },
  {
    id: 7,
    title: 'The Crossover Series',
    description: 'Where DAX meets Rohn. Where APIs meet purpose. Your unique territory.',
    pillar: 'Crossover',
    pillarColor: '#7F77DD',
    pillarBg: 'rgba(127,119,221,0.1)',
    icon: Brain,
    lessons: 5,
    duration: '2h 30m',
    level: 'All levels',
    free: true,
    progress: 0,
    featured: true,
  },
]

const STATS = [
  { icon: PlayCircle, value: '50+', label: 'Lessons', color: '#D4AF37' },
  { icon: Clock, value: '27h', label: 'Content', color: '#1D9E75' },
  { icon: Users, value: '3', label: 'Pillars', color: '#378ADD' },
  { icon: Star, value: 'Free', label: 'Guest access', color: '#EF9F27' },
]

const FILTER_PILLS = ['All', 'Data & BI', 'App Dev', 'Philosophy', 'Crossover', 'Free']

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [filter, setFilter] = useState('All')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isGuest = user.role === 'guest'
  const displayName = user.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : 'Learner'

  const filtered = COURSES.filter(c => {
    if (filter === 'All') return true
    if (filter === 'Free') return c.free
    return c.pillar === filter
  })

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#courses" className="font-sans text-sm text-text-secondary hover:text-text-primary transition-colors">Courses</a>
              <a href="https://learn.fttgsolutions.com/articles" className="font-sans text-sm text-text-secondary hover:text-text-primary transition-colors">Articles</a>
              <a href="https://www.fttgsolutions.com" className="font-sans text-sm text-text-secondary hover:text-text-primary transition-colors" target="_blank" rel="noopener noreferrer">fttgsolutions.com</a>
            </div>

            {/* User area */}
            <div className="hidden md:flex items-center gap-3">
              {isGuest ? (
                <span className="tag-pill bg-gold-muted text-gold border border-gold-border text-xs">Guest</span>
              ) : (
                <span className="font-sans text-sm text-text-secondary">{displayName}</span>
              )}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 font-sans text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                <LogOut size={14} />
                {isGuest ? 'Sign in' : 'Sign out'}
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-text-secondary"
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-bg-secondary px-4 py-4 space-y-3">
            <a href="#courses" className="block font-sans text-sm text-text-secondary py-1">Courses</a>
            <a href="https://www.fttgsolutions.com" className="block font-sans text-sm text-text-secondary py-1">fttgsolutions.com</a>
            <div className="pt-2 border-t border-white/5">
              <button onClick={onLogout} className="flex items-center gap-2 font-sans text-sm text-text-muted">
                <LogOut size={14} />
                {isGuest ? 'Sign in' : 'Sign out'}
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gold/3 blur-3xl rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
          <div className="animate-fade-in">
            {isGuest ? (
              <>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-muted border border-gold-border rounded-sm mb-4">
                  <Sparkles size={12} className="text-gold" />
                  <span className="font-sans text-xs font-semibold text-gold tracking-wide">Browsing as guest — create an account for full access</span>
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                  Explore FTTG Learn
                </h1>
              </>
            ) : (
              <>
                <p className="font-sans text-text-muted text-sm tracking-widest uppercase mb-2">Welcome back</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                  Hey, {displayName} 👋
                </h1>
              </>
            )}
            <p className="font-sans text-text-secondary text-lg mt-3 max-w-xl">
              Technical training and timeless philosophy for builders. Pick a pillar and start learning.
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
        <div className="flex items-center gap-2 flex-wrap mb-8">
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
            {filtered.length} course{filtered.length !== 1 ? 's' : ''}
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
                      <Sparkles size={8} /> Featured
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
                        <span className="tag-pill bg-accent-bi/10 text-accent-bi border border-accent-bi/20 text-[10px]">Free</span>
                      ) : (
                        <span className="tag-pill bg-gold-muted text-gold border border-gold-border text-[10px]">Member</span>
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
                    {course.lessons} lessons
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
                      Members only
                    </>
                  ) : (
                    <>
                      Start learning
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
              <h3 className="font-display font-bold text-text-primary text-lg">Unlock everything</h3>
              <p className="font-sans text-text-secondary text-sm mt-1">
                Create a free account to access all member courses, track your progress, and join the community.
              </p>
            </div>
            <button className="btn-gold flex-shrink-0 text-sm">
              Create account <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">

            {/* Logo + copyright */}
            <div className="flex flex-col gap-3">
              <Logo size="sm" />
              <p className="font-sans text-text-muted text-xs">
                © 2026 FTTG Solutions LLC
              </p>
            </div>

            {/* Nav links */}
            <div className="flex gap-10">
              <div className="flex flex-col gap-2">
                <p className="font-sans text-[10px] font-semibold tracking-widest uppercase text-text-muted mb-1">Learn</p>
                <a href="#courses" className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors">Courses</a>
                <a href="https://learn.fttgsolutions.com/articles" className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors">Articles</a>
              </div>
              <div className="flex flex-col gap-2">
                <p className="font-sans text-[10px] font-semibold tracking-widest uppercase text-text-muted mb-1">Company</p>
                <a href="https://www.fttgsolutions.com" target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors">fttgsolutions.com</a>
                <a href="https://www.fttgsolutions.com/contact" target="_blank" rel="noopener noreferrer" className="font-sans text-xs text-text-secondary hover:text-text-primary transition-colors">Contact</a>
              </div>
            </div>

          </div>
        </div>
      </footer>
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
