'use client'

import { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import { ExternalLink } from 'lucide-react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import EmptyState from '@/components/EmptyState'
import FilterBar, { FilterPill, PillColor } from '@/components/FilterBar'
import FavoriteButton from '@/components/FavoriteButton'
import content from '@/lib/content'
import resources from '@/lib/resources'

const TAG_COLORS: Record<string, PillColor> = {
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
  Cert:      { text: '#10B981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
}

const DEFAULT_TAG: PillColor = { text: '#D4AF37', bg: 'rgba(212,175,55,0.1)', border: 'rgba(212,175,55,0.2)' }

export default function ResourcesPage() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const pills = useMemo<FilterPill[]>(() => {
    const tags = new Set<string>()
    resources.categories.forEach(c => c.items.forEach(i => tags.add(i.tag)))
    return Array.from(tags).map(tag => ({ label: tag, colors: TAG_COLORS[tag] ?? DEFAULT_TAG }))
  }, [])

  const allItems = useMemo(() =>
    resources.categories.flatMap(c => c.items.map(i => ({ ...i, category: c.heading }))),
  [])

  const fuse = useMemo(() => new Fuse(allItems, {
    keys: [
      { name: 'label',       weight: 0.6 },
      { name: 'description', weight: 0.3 },
      { name: 'tag',         weight: 0.1 },
    ],
    threshold: 0.35,
  }), [allItems])

  const filteredCategories = useMemo(() => {
    const q = search.trim()
    const matchedLabels = q
      ? new Set(fuse.search(q).map(r => r.item.label))
      : null
    return resources.categories
      .map(category => ({
        ...category,
        items: category.items.filter(item => {
          const matchesTag = !activeTag || item.tag === activeTag
          const matchesSearch = !matchedLabels || matchedLabels.has(item.label)
          return matchesTag && matchesSearch
        }),
      }))
      .filter(category => category.items.length > 0)
  }, [search, activeTag, fuse])

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
                {content.resources.title}
              </h1>
              <p className="font-sans text-text-secondary text-lg mt-3 max-w-xl">
                {content.resources.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="gold-line mx-8" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-0">
          <FilterBar
            pills={pills}
            activePill={activeTag}
            onPillChange={setActiveTag}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search resources..."
          />
        </div>

        {/* Resource categories */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {filteredCategories.length === 0 ? (
            <EmptyState query={search || undefined} />
          ) : (
            filteredCategories.map(category => (
              <section key={category.heading}>
                <h2 className="font-display font-bold text-text-primary text-xl mb-5">
                  {category.heading}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {category.items.map(item => {
                    const colors = TAG_COLORS[item.tag] ?? DEFAULT_TAG
                    return (
                      <a
                        key={item.label}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card-dark p-5 flex flex-col gap-3 group border border-transparent hover:border-white/10 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span
                              className="tag-pill font-semibold mb-2 inline-block"
                              style={{ color: colors.text, background: colors.bg, borderColor: colors.border, borderWidth: 1, borderStyle: 'solid' }}
                            >
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
                        <p className="font-sans text-text-secondary text-sm leading-relaxed">
                          {item.description}
                        </p>
                      </a>
                    )
                  })}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
