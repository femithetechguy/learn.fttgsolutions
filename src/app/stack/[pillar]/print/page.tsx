'use client'

import { useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { SI_MAP, CUSTOM_MAP } from '@/lib/brand-icons'
import dataBi     from '../../../../../data/pillars/data-bi.json'
import appDev     from '../../../../../data/pillars/app-dev.json'
import philosophy from '../../../../../data/pillars/philosophy.json'

const PILLARS: Record<string, typeof dataBi> = {
  'data-bi':    dataBi,
  'app-dev':    appDev,
  'philosophy': philosophy,
}

const PILLAR_COLORS: Record<string, string> = {
  'data-bi':    '#1D9E75',
  'app-dev':    '#378ADD',
  'philosophy': '#EF9F27',
}

export default function StackPrintPage() {
  const { pillar } = useParams<{ pillar: string }>()
  const data  = PILLARS[pillar]
  const color = PILLAR_COLORS[pillar] ?? '#888'

  useEffect(() => {
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [])

  if (!data) notFound()

  return (
    <>
      <style>{`
        @page { margin: 0.8cm 1cm; size: A4; }
        @media print {
          .no-print { display: none !important; }
          html, body { background: white !important; color: black !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="bg-white text-black min-h-screen px-8 py-6 font-sans">

        {/* Toolbar — screen only */}
        <div className="no-print mb-6 flex items-center justify-between">
          <Link
            href={`/stack/${pillar}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Stack
          </Link>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm rounded font-medium hover:bg-gray-800 transition-colors"
            style={{ backgroundImage: 'linear-gradient(180deg,rgba(255,255,255,0.12) 0%,rgba(0,0,0,0.12) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22),inset 0 -1px 0 rgba(0,0,0,0.55),inset 1px 0 0 rgba(255,255,255,0.08),inset -1px 0 0 rgba(0,0,0,0.18),0 2px 6px rgba(0,0,0,0.35)' }}
          >
            <Printer size={14} />
            Print
          </button>
        </div>

        {/* Sheet header */}
        <div className="mb-3 pb-2 border-b-2 border-black">
          <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color }}>
            learn.fttgsolutions.com · The Stack
          </p>
          <h1 className="text-xl font-bold leading-tight text-black mt-0.5">{data.headline}</h1>
          <p className="text-gray-600 text-xs mt-0.5 font-medium">{data.tagline}</p>
        </div>

        {/* 2-column grid of categories */}
        <div style={{ columns: 2, columnGap: '1.2cm' }}>
          {data.stack.map(cat => (
            <div key={cat.category} style={{ breakInside: 'avoid-column', marginBottom: '0.35cm' }}>

              {/* Category header */}
              <div className="text-[8.5px] font-bold uppercase tracking-widest text-black bg-gray-100 px-1.5 py-0.5 border-l-[3px] mb-0.5" style={{ borderColor: color }}>
                {cat.category}
              </div>

              {/* Tools table: name | definition */}
              <table className="w-full border-collapse">
                <tbody>
                  {cat.tools.map((tool, i) => {
                    const path = (tool.slug ? SI_MAP[tool.slug]?.path : undefined) ?? (tool.slug ? CUSTOM_MAP[tool.slug] : undefined)
                    return (
                      <tr
                        key={tool.name}
                        style={{ breakInside: 'avoid', background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}
                      >
                        <td
                          className="align-top border-b border-gray-100"
                          style={{ fontSize: '9px', padding: '2px 6px 2px 2px', width: '30%', whiteSpace: 'nowrap' }}
                        >
                          <span className="inline-flex items-center gap-1">
                            {path && (
                              <svg role="img" viewBox="0 0 24 24" width={8} height={8} fill={`#${tool.color}`} aria-label={tool.name}>
                                <path d={path} />
                              </svg>
                            )}
                            <span className="font-bold text-black">{tool.name}</span>
                          </span>
                        </td>
                        <td
                          className="text-gray-600 align-top border-b border-gray-100"
                          style={{ fontSize: '8.5px', padding: '2px 2px 2px 4px', width: '70%', lineHeight: 1.35 }}
                        >
                          {tool.definition ?? ''}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

            </div>
          ))}
        </div>

      </div>
    </>
  )
}
