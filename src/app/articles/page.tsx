'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Construction, Clock, ArrowRight } from 'lucide-react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import content from '@/lib/content'
import articlesData, { ARTICLES, type Article } from '@/lib/articles'

const PILLARS = [
  { key: 'data-bi',    label: 'Data & BI',  color: '#1D9E75' },
  { key: 'app-dev',    label: 'App Dev',     color: '#378ADD' },
  { key: 'philosophy', label: 'Philosophy',  color: '#EF9F27' },
] as const

type PillarKey = typeof PILLARS[number]['key']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function pillarMeta(key: string) {
  return PILLARS.find(p => p.key === key) ?? { label: key, color: '#D4AF37' }
}

function ArticleCard({ article }: { article: Article }) {
  const meta = pillarMeta(article.pillar)
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="card-dark p-6 flex flex-col gap-4 group border border-transparent hover:border-white/10 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="tag-pill font-semibold"
          style={{ color: meta.color, background: `${meta.color}18`, border: `1px solid ${meta.color}33` }}
        >
          {meta.label}
        </span>
        <span className="flex items-center gap-1 font-sans text-xs text-text-muted">
          <Clock size={11} />
          {article.readTime} min read
        </span>
      </div>

      <div>
        <h2 className="font-display font-bold text-text-primary text-lg leading-snug group-hover:text-gold transition-colors duration-150 mb-1.5">
          {article.title}
        </h2>
        <p className="font-sans text-text-secondary text-sm leading-relaxed">
          {article.subtitle}
        </p>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
        <span className="font-sans text-xs text-text-muted">{formatDate(article.date)}</span>
        <ArrowRight size={14} className="text-text-muted group-hover:text-gold group-hover:translate-x-0.5 transition-all duration-150" />
      </div>
    </Link>
  )
}

export default function ArticlesPage() {
  const [activeFilter, setActiveFilter] = useState<PillarKey | null>(null)

  const filtered = useMemo(() => {
    if (!activeFilter) return ARTICLES
    return ARTICLES.filter(a => a.pillar === activeFilter)
  }, [activeFilter])

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
                {content.articles.title}
              </h1>
              <p className="font-sans text-text-secondary text-lg mt-3 max-w-xl">
                {content.articles.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="gold-line mx-8" />

        {articlesData.comingSoon ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-sm bg-gold-muted border border-gold-border flex items-center justify-center">
              <Construction size={28} className="text-gold" />
            </div>
            <h2 className="font-display font-bold text-text-primary text-2xl sm:text-3xl max-w-lg">
              {articlesData.comingSoonHeading}
            </h2>
            <p className="font-sans text-text-secondary text-base max-w-md leading-relaxed">
              {articlesData.comingSoonMessage}
            </p>
            <p className="font-sans text-text-muted text-sm italic">
              {articlesData.comingSoonSubtext}
            </p>
            <a
              href="/#courses"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-gold/10 border border-gold/20 text-gold font-sans text-sm font-semibold rounded-sm hover:bg-gold hover:text-bg-primary transition-all duration-150"
            >
              Browse courses instead
            </a>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            {/* Pillar filter */}
            <div className="flex items-center gap-2 flex-wrap mb-10">
              <button
                onClick={() => setActiveFilter(null)}
                className={`font-sans text-sm font-semibold px-5 py-2 rounded-sm border transition-all duration-150 ${
                  activeFilter === null
                    ? 'bg-gold text-bg-primary border-transparent bevel-active'
                    : 'border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'
                }`}
              >
                All
              </button>
              {PILLARS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setActiveFilter(activeFilter === p.key ? null : p.key)}
                  className={`font-sans text-sm font-semibold px-5 py-2 rounded-sm border transition-all duration-150 ${
                    activeFilter === p.key
                      ? 'text-bg-primary border-transparent'
                      : 'border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'
                  }`}
                  style={activeFilter === p.key ? { background: p.color, borderColor: p.color } : {}}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Article grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(a => <ArticleCard key={a.slug} article={a} />)}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center gap-2 text-center">
                <p className="font-display font-bold text-text-primary text-lg">No articles yet for this pillar.</p>
                <p className="font-sans text-text-muted text-sm">Check back soon or browse all.</p>
              </div>
            )}

          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
