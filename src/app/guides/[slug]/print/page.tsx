import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import { marked } from 'marked'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import GuidePrintTrigger from '@/components/GuidePrintTrigger'
import { GUIDES } from '@/lib/guides'

const PILLAR_META: Record<string, { label: string; color: string }> = {
  'data-bi':    { label: 'Data & BI',  color: '#1D9E75' },
  'app-dev':    { label: 'App Dev',     color: '#378ADD' },
  'philosophy': { label: 'Philosophy',  color: '#EF9F27' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function GuidePrintPage({ params }: { params: { slug: string } }) {
  const guide = GUIDES.find(g => g.slug === params.slug)
  if (!guide) notFound()

  const filePath = path.join(process.cwd(), 'data', guide.src)
  const markdown = fs.readFileSync(filePath, 'utf-8')
  const html     = marked.parse(markdown) as string

  const meta  = PILLAR_META[guide.pillar]
  const color = meta?.color ?? '#888'

  return (
    <>
      <style>{`
        ::selection { background: rgba(0,0,0,0.12); color: black; }
        @page { margin: 1cm 1.2cm; size: A4; }
        @media print {
          .no-print { display: none !important; }
          html, body { background: white !important; color: black !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .print-body h1 { font-size: 1.6rem; font-weight: 800; color: black; margin-bottom: 0.75rem; line-height: 1.2; }
        .print-body h2 { font-size: 1.1rem; font-weight: 700; color: black; margin-top: 1.5rem; margin-bottom: 0.4rem; }
        .print-body h3 { font-size: 0.95rem; font-weight: 700; color: black; margin-top: 1rem; margin-bottom: 0.3rem; }
        .print-body p  { font-size: 0.875rem; color: #374151; line-height: 1.7; margin-bottom: 0.75rem; }
        .print-body ul, .print-body ol { margin-left: 1.25rem; margin-bottom: 0.75rem; }
        .print-body li { font-size: 0.875rem; color: #374151; line-height: 1.6; margin-bottom: 0.2rem; }
        .print-body strong { color: black; font-weight: 600; }
        .print-body blockquote { border-left: 3px solid ${color}; padding-left: 0.75rem; margin: 1rem 0; }
        .print-body blockquote p { font-style: italic; color: #6b7280; }
        .print-body code { font-family: monospace; font-size: 0.8em; background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 2px; padding: 1px 4px; }
        .print-body pre { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; padding: 0.75rem 1rem; margin-bottom: 0.75rem; overflow-x: auto; max-width: 100%; }
        .print-body code { white-space: pre-wrap; word-break: break-all; }
        .print-body table { width: 100%; word-break: break-word; }
        .print-body td, .print-body th { overflow-wrap: break-word; }
        .print-body pre code { background: none; border: none; padding: 0; }
        .print-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.25rem 0; }
        .print-body a { color: ${color}; }
      `}</style>

      <div className="bg-white text-black min-h-screen px-8 py-6 font-sans">

        {/* Toolbar — screen only */}
        <div className="no-print mb-6 flex items-center justify-between">
          <Link
            href={`/guides/${params.slug}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            Back to guide
          </Link>
          <GuidePrintTrigger />
        </div>

        {/* Guide header */}
        <div className="mb-4 pb-3 border-b-2 border-black">
          <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color }}>
            learn.fttgsolutions.com · {meta?.label}
          </p>
          <h1 className="text-2xl font-bold leading-tight text-black mt-1">{guide.title}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{guide.subtitle}</p>
          <p className="text-gray-400 text-xs mt-1">
            {guide.author && <>{guide.author} · </>}{formatDate(guide.date)} · {guide.readTime} min read
          </p>
        </div>

        {/* Guide body */}
        <div
          className="print-body"
          dangerouslySetInnerHTML={{ __html: html }}
        />

      </div>
    </>
  )
}
