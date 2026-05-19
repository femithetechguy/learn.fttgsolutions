import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import Nav from '@/components/Nav'
import GuideHub, { type TocItem } from '@/components/GuideHub'
import { GUIDES } from '@/lib/guides'
import content from '@/lib/content'

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parseMarkdownWithToc(markdown: string): { html: string; headings: TocItem[] } {
  const headings: TocItem[] = []

  const headingRe = /^(#{2,3})\s+(.+)$/gm
  let m: RegExpExecArray | null
  while ((m = headingRe.exec(markdown)) !== null) {
    const level = m[1].length
    const raw   = m[2].trim().replace(/[*_`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    headings.push({ id: slugify(raw), text: raw, level })
  }

  let html = marked.parse(markdown) as string
  let idx  = 0
  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_, lvl, inner) => {
    const h = headings[idx++]
    return h ? `<h${lvl} id="${h.id}">${inner}</h${lvl}>` : `<h${lvl}>${inner}</h${lvl}>`
  })

  return { html, headings }
}

export default function GuidesPage() {
  const contents: Record<string, { html: string; headings: TocItem[] }> = {}

  for (const guide of GUIDES) {
    try {
      const filePath = path.join(process.cwd(), 'data', guide.src)
      const markdown = fs.readFileSync(filePath, 'utf-8')
      contents[guide.slug] = parseMarkdownWithToc(markdown)
    } catch {
      contents[guide.slug] = { html: '<p>Content not available.</p>', headings: [] }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary bg-grid overflow-hidden">
      <Nav />

      {/* Hero */}
      <div className="flex-shrink-0">
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
      </div>

      <GuideHub guides={GUIDES} contents={contents} />
    </div>
  )
}
