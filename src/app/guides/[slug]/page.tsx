import fs from 'fs'
import path from 'path'
import { notFound } from 'next/navigation'
import { marked } from '@/lib/marked-setup'
import Nav from '@/components/Nav'
import GuideHub, { type TocItem } from '@/components/GuideHub'
import { GUIDES } from '@/lib/guides'

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
