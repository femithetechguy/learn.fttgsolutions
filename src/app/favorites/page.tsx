'use client'

import { useEffect, useState } from 'react'
import { Heart, ExternalLink, PlayCircle, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import FavoriteButton from '@/components/FavoriteButton'
import { getAuthState, AuthState } from '@/lib/userStore'
import { ICON_MAP } from '@/components/FilterBar'
import content from '@/lib/content'
import resourcesData from '@/lib/resources'
import coursesData from '@/lib/courses'

const TAG_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Docs:      { text: '#378ADD', bg: 'rgba(55,138,221,0.1)',  border: 'rgba(55,138,221,0.2)'  },
  Hosting:   { text: '#1D9E75', bg: 'rgba(29,158,117,0.1)', border: 'rgba(29,158,117,0.2)'  },
  Backend:   { text: '#7F77DD', bg: 'rgba(127,119,221,0.1)',border: 'rgba(127,119,221,0.2)' },
  Styling:   { text: '#EF9F27', bg: 'rgba(239,159,39,0.1)', border: 'rgba(239,159,39,0.2)'  },
  Data:      { text: '#1D9E75', bg: 'rgba(29,158,117,0.1)', border: 'rgba(29,158,117,0.2)'  },
  BI:        { text: '#EF9F27', bg: 'rgba(239,159,39,0.1)', border: 'rgba(239,159,39,0.2)'  },
  FTTG:      { text: '#D4AF37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.2)'  },
  Community: { text: '#378ADD', bg: 'rgba(55,138,221,0.1)', border: 'rgba(55,138,221,0.2)'  },
  Learning:  { text: '#7F77DD', bg: 'rgba(127,119,221,0.1)',border: 'rgba(127,119,221,0.2)' },
  YouTube:   { text: '#EF4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.2)'   },
  Tools:     { text: '#A78BFA', bg: 'rgba(167,139,250,0.1)',border: 'rgba(167,139,250,0.2)' },
}
const DEFAULT_TAG = { text: '#D4AF37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.2)' }

const ALL_RESOURCES = resourcesData.categories.flatMap(c => c.items)
const ALL_COURSES = coursesData.map(c => {
  const pillar = content.pillars.find(p => p.label === c.pillar)
  return {
    ...c,
    Icon: pillar?.icon ? ICON_MAP[pillar.icon] : null,
    pillarColor: pillar?.color ?? '#D4AF37',
    pillarBg:   pillar?.bg   ?? 'rgba(212,175,55,0.1)',
  }
})

export default function FavoritesPage() {
  const [auth, setAuth]       = useState<AuthState>(null)
  const [favIds, setFavIds]   = useState<Set<string>>(new Set())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setAuth(getAuthState())
    try {
      const raw = localStorage.getItem('fttg_favorites')
      if (raw) setFavIds(new Set(JSON.parse(raw)))
    } catch {}
    setMounted(true)

    const onStorage = () => {
      try {
        const raw = localStorage.getItem('fttg_favorites')
        setFavIds(new Set(raw ? JSON.parse(raw) : []))
      } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  if (!mounted) return null

  // ── Guest / logged-out gate ──
  if (auth !== 'member') {
    return (
      <div className="min-h-screen bg-bg-primary bg-grid flex flex-col">
        <Nav />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-5">
          <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Heart size={24} className="text-gold" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Your favourites are waiting
          </h1>
          <p className="font-sans text-text-secondary text-base max-w-sm">
            {auth === 'guest'
              ? 'You\'re browsing as a guest. Create a free account to save courses and resources.'
              : 'Sign in to access your saved courses and resources.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a href="/?view=register" className="btn-gold text-sm px-6 py-2.5">
              Create account
            </a>
            <a href="/" className="btn-ghost text-sm px-6 py-2.5">
              Sign in
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const favResources = ALL_RESOURCES.filter(r => favIds.has(`resource:${r.label}`))
  const favCourses   = ALL_COURSES.filter(c => favIds.has(`course:${c.id}`))
  const isEmpty      = favResources.length === 0 && favCourses.length === 0

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">
      <Nav />
      <div className="overflow-x-hidden">

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 sm:w-[600px] h-64 sm:h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
            <div className="animate-fade-in flex items-center gap-3">
              <Heart size={28} className="text-gold fill-gold flex-shrink-0" />
              <div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                  Favourites
                </h1>
                <p className="font-sans text-text-secondary text-lg mt-1">
                  {isEmpty ? 'Nothing saved yet.' : `${favIds.size} saved item${favIds.size !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="gold-line mx-8" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

          {isEmpty && (
            <div className="py-16 flex flex-col items-center text-center gap-3">
              <span className="text-4xl">🤍</span>
              <p className="font-display font-bold text-text-primary text-lg">Nothing saved yet</p>
              <p className="font-sans text-text-muted text-sm max-w-xs">
                Hit the heart icon on any course or resource to save it here.
              </p>
              <div className="flex gap-3 mt-2">
                <a href="/courses" className="btn-gold text-sm px-5 py-2">Browse courses</a>
                <a href="/resources" className="btn-ghost text-sm px-5 py-2">Browse resources</a>
              </div>
            </div>
          )}

          {/* Saved Courses */}
          {favCourses.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-text-primary text-xl mb-5">Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {favCourses.map(course => {
                  const Icon = course.Icon
                  return (
                    <div key={course.id} className="card-dark p-5 flex flex-col gap-4 border border-transparent hover:border-white/10 transition-all duration-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: course.pillarBg }}>
                          {Icon && <Icon size={18} style={{ color: course.pillarColor }} />}
                        </div>
                        <FavoriteButton id={`course:${course.id}`} className="ml-auto" />
                      </div>
                      <div>
                        <span className="font-sans text-[10px] font-semibold tracking-widest uppercase" style={{ color: course.pillarColor }}>
                          {course.pillar}
                        </span>
                        <h3 className="font-display font-bold text-text-primary text-base leading-snug mt-0.5">{course.title}</h3>
                      </div>
                      <p className="font-sans text-text-secondary text-sm leading-relaxed flex-1">{course.description}</p>
                      <div className="flex items-center gap-3 font-sans text-xs text-text-muted">
                        <span className="flex items-center gap-1"><PlayCircle size={11} />{course.lessons} lessons</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{course.duration}</span>
                        <span className="flex items-center gap-1"><TrendingUp size={11} />{course.level}</span>
                      </div>
                      <a href="/courses" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm font-sans text-sm font-semibold bg-gold/10 border border-gold/20 text-gold hover:bg-gold hover:text-bg-primary transition-all duration-150">
                        Go to course <ChevronRight size={14} />
                      </a>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Saved Resources */}
          {favResources.length > 0 && (
            <section>
              <h2 className="font-display font-bold text-text-primary text-xl mb-5">Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {favResources.map(item => {
                  const colors = TAG_COLORS[item.tag] ?? DEFAULT_TAG
                  return (
                    <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer"
                      className="card-dark p-5 flex flex-col gap-3 group border border-transparent hover:border-white/10 transition-all duration-200">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="tag-pill text-[10px] font-semibold mb-2 inline-block"
                            style={{ color: colors.text, background: colors.bg, borderColor: colors.border, borderWidth: 1, borderStyle: 'solid' }}>
                            {item.tag}
                          </span>
                          <h3 className="font-display font-bold text-text-primary text-base leading-snug group-hover:text-gold transition-colors">
                            {item.label}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <FavoriteButton id={`resource:${item.label}`} />
                          <ExternalLink size={14} className="text-text-muted mt-1 group-hover:text-gold transition-colors" />
                        </div>
                      </div>
                      <p className="font-sans text-text-secondary text-sm leading-relaxed">{item.description}</p>
                    </a>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
