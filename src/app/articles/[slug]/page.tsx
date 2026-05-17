import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import Link from 'next/link'
import { Clock, ArrowLeft } from 'lucide-react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ArticleActions from '@/components/ArticleActions'
import { ARTICLES } from '@/lib/articles'

const PILLAR_META: Record<string, { label: string; color: string }> = {
  'data-bi':    { label: 'Data & BI',  color: '#1D9E75' },
  'app-dev':    { label: 'App Dev',     color: '#378ADD' },
  'philosophy': { label: 'Philosophy',  color: '#EF9F27' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = ARTICLES.find(a => a.slug === params.slug)
  if (!article) notFound()

  const filePath = path.join(process.cwd(), 'data', article.src)
  const markdown = fs.readFileSync(filePath, 'utf-8')
  const html     = marked.parse(markdown) as string

  const meta  = PILLAR_META[article.pillar]
  const color = meta?.color ?? '#D4AF37'

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">
      <Nav />

      <div className="overflow-x-hidden">

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 sm:w-[600px] h-64 sm:h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
            <div className="animate-fade-in">

              {/* Back link */}
              <Link
                href="/articles"
                className="inline-flex items-center gap-1.5 font-sans text-sm text-text-muted hover:text-text-secondary transition-colors mb-6"
              >
                <ArrowLeft size={13} />
                All Articles
              </Link>

              {/* Pillar + meta row */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className="tag-pill font-semibold"
                    style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}
                  >
                    {meta?.label}
                  </span>
                  <span className="flex items-center gap-1.5 font-sans text-xs text-text-muted">
                    <Clock size={11} />
                    {article.readTime} min read
                  </span>
                  <span className="font-sans text-xs text-text-muted">{formatDate(article.date)}</span>
                </div>
                <ArticleActions slug={params.slug} title={article.title} />
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight mb-4">
                {article.title}
              </h1>
              <p className="font-sans text-text-secondary text-lg leading-relaxed">
                {article.subtitle}
              </p>

            </div>
          </div>
        </div>

        <div className="gold-line mx-8" />

        {/* Article body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>

      </div>

      <Footer />
    </div>
  )
}
