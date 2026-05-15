'use client'

import { Construction } from 'lucide-react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import content from '@/lib/content'
import articles from '@/lib/articles'

export default function ArticlesPage() {
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

        {articles.comingSoon && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-sm bg-gold-muted border border-gold-border flex items-center justify-center">
              <Construction size={28} className="text-gold" />
            </div>
            <h2 className="font-display font-bold text-text-primary text-2xl sm:text-3xl max-w-lg">
              {articles.comingSoonHeading}
            </h2>
            <p className="font-sans text-text-secondary text-base max-w-md leading-relaxed">
              {articles.comingSoonMessage}
            </p>
            <p className="font-sans text-text-muted text-sm italic">
              {articles.comingSoonSubtext}
            </p>
            <a
              href="/#courses"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-gold/10 border border-gold/20 text-gold font-sans text-sm font-semibold rounded-sm hover:bg-gold hover:text-bg-primary transition-all duration-150"
            >
              Browse courses instead
            </a>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
