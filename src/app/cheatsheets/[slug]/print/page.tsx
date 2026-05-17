'use client'

import { useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import { SHEETS } from '../../../../../data/cheatsheets/registry'
import SheetIcon from '@/components/SheetIcon'

export default function PrintPage() {
  const { slug } = useParams<{ slug: string }>()
  const sheet = SHEETS.find(s => s.key === slug)
  if (!sheet) notFound()
  const color = `#${sheet.data.color}`

  useEffect(() => {
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        ::selection { background: rgba(0,0,0,0.12); color: black; }
        @page { margin: 0.8cm 1cm; size: A4; }
        .print-cols { columns: 1; column-gap: 1.2cm; }
        table { width: 100%; word-break: break-word; }
        td, th { overflow-wrap: break-word; }
        code { white-space: pre-wrap; word-break: break-all; }
        @media (min-width: 640px) { .print-cols { columns: 2; } }
        @media print {
          .no-print { display: none !important; }
          .print-cols { columns: 2; }
          html, body { background: white !important; color: black !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="bg-white text-black min-h-screen px-8 py-6 font-sans">

        {/* Toolbar — screen only */}
        <div className="no-print mb-6 flex items-center justify-between">
          <Link
            href={`/cheatsheets/${slug}`}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            Back to {sheet.data.label}
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
          <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color }}>learn.fttgsolutions.com · Cheat Sheets</p>
          <div className="flex items-center gap-2 mt-0.5">
            <SheetIcon sheetKey={slug} color={color} size={18} />
            <h1 className="text-xl font-bold leading-tight text-black">{sheet.data.headline}</h1>
          </div>
          <p className="text-gray-600 text-xs mt-0.5 font-medium">{sheet.data.tagline}</p>
        </div>

        {/* 2-column grid of categories */}
        <div className="print-cols">
          {sheet.data.categories.map(cat => (
            <div key={cat.category} style={{ breakInside: 'avoid-column', marginBottom: '0.35cm' }}>

              {/* Category header */}
              <div className="text-[8.5px] font-bold uppercase tracking-widest text-black bg-gray-100 px-1.5 py-0.5 border-l-[3px] border-black mb-0">
                {cat.category}
              </div>

              {/* Items table */}
              <table className="w-full border-collapse">
                <tbody>
                  {cat.items.map((item, i) => (
                    <tr
                      key={item.name}
                      style={{ breakInside: 'avoid', background: i % 2 === 0 ? '#ffffff' : '#f9fafb' }}
                    >
                      {/* Name */}
                      <td
                        className="font-bold text-black align-top border-b border-gray-100"
                        style={{ fontSize: '9px', padding: '2px 4px 2px 2px', width: '18%', whiteSpace: 'nowrap' }}
                      >
                        {item.name}
                      </td>
                      {/* Syntax */}
                      <td
                        className="align-top border-b border-gray-100"
                        style={{ fontSize: '9px', padding: '2px 4px', width: '37%' }}
                      >
                        <code
                          className="block font-mono bg-gray-100 border border-gray-200 rounded"
                          style={{ fontSize: '8.5px', padding: '1px 3px', whiteSpace: 'pre-wrap', lineHeight: 1.4, color: '#92400e' }}
                        >
                          {item.syntax}
                        </code>
                      </td>
                      {/* Definition */}
                      <td
                        className="text-gray-700 align-top border-b border-gray-100"
                        style={{ fontSize: '8.5px', padding: '2px 2px 2px 4px', width: '45%', lineHeight: 1.35 }}
                      >
                        {item.definition}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          ))}
        </div>

      </div>
    </>
  )
}
