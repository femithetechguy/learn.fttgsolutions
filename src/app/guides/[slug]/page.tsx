import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import Nav from '@/components/Nav'
import GuideHub, { type TocItem } from '@/components/GuideHub'
import { GUIDES } from '@/lib/guides'

const COPY_ICON = `<svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
const CHECK_ICON = `<svg class="check-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`

marked.use({
  renderer: {
    code({ text, lang, escaped }: { text: string; lang?: string; escaped?: boolean }) {
      const code = escaped ? text : text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      const langClass = lang ? ` class="language-${lang}"` : ''
      return `<div class="code-block-wrapper"><button class="copy-code-btn" aria-label="Copy code">${COPY_ICON}${CHECK_ICON}</button><pre><code${langClass}>${code}</code></pre></div>\n`
    }
  }
})

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

export default function GuideSlugPage({ params }: { params: { slug: string } }) {
  const guide = GUIDES.find(g => g.slug === params.slug)
  if (!guide) notFound()

  const contents: Record<string, { html: string; headings: TocItem[] }> = {}
  for (const g of GUIDES) {
    try {
      const markdown = fs.readFileSync(path.join(process.cwd(), 'data', g.src), 'utf-8')
      contents[g.slug] = parseMarkdownWithToc(markdown)
    } catch {
      contents[g.slug] = { html: '<p>Content not available.</p>', headings: [] }
    }
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      <Nav />
      <GuideHub guides={GUIDES} contents={contents} initialSlug={params.slug} />
    </div>
  )
}
