'use client'

import { useState } from 'react'
import { Layers } from 'lucide-react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import StackGrid from '@/components/StackGrid'
import dataBi     from '../../../data/pillars/data-bi.json'
import appDev     from '../../../data/pillars/app-dev.json'
import philosophy from '../../../data/pillars/philosophy.json'

const PILLARS = [
  { key: 'data-bi',     label: 'Data & BI',   color: '#1D9E75', data: dataBi     },
  { key: 'app-dev',     label: 'App Dev',      color: '#378ADD', data: appDev     },
  { key: 'philosophy',  label: 'Philosophy',   color: '#EF9F27', data: philosophy  },
] as const

type PillarKey = typeof PILLARS[number]['key']

export default function StackPage() {
  const [active, setActive] = useState<PillarKey>('data-bi')
  const pillar = PILLARS.find(p => p.key === active)!

  return (
    <div className="min-h-screen bg-bg-primary bg-grid">
      <Nav />

      <div className="overflow-x-hidden">

        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 sm:w-[600px] h-64 sm:h-[400px] bg-gold/5 blur-3xl rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
            <div className="animate-fade-in flex items-start gap-4">
              <div className="w-11 h-11 rounded-sm flex items-center justify-center shrink-0 mt-1" style={{ background: `${pillar.color}18` }}>
                <Layers size={20} style={{ color: pillar.color }} />
              </div>
              <div>
                <p className="font-sans text-sm text-text-muted tracking-widest uppercase mb-1">The Stack</p>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary leading-tight">
                  {pillar.data.headline}
                </h1>
                <p className="font-sans text-text-secondary text-lg mt-3 max-w-2xl">
                  {pillar.data.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="gold-line mx-8" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Pillar tabs */}
          <div className="flex items-center gap-2 mb-10 flex-wrap">
            {PILLARS.map(p => (
              <button
                key={p.key}
                onClick={() => setActive(p.key)}
                className={`font-sans text-sm font-semibold px-5 py-2 rounded-sm border transition-all duration-150 ${
                  active === p.key
                    ? 'text-bg-primary border-transparent'
                    : 'border-white/10 text-text-secondary hover:border-white/20 hover:text-text-primary'
                }`}
                style={active === p.key ? { background: p.color, borderColor: p.color } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Tagline */}
          <p className="font-sans text-base font-semibold text-gold mb-8">
            {pillar.data.tagline}
          </p>

          {/* Stack grid */}
          <StackGrid categories={pillar.data.stack} columns={3} />

        </div>
      </div>

      <Footer />
    </div>
  )
}
