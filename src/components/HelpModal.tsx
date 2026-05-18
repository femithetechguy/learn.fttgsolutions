'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronDown } from 'lucide-react'
import content from '@/lib/content'

const { help } = content

type Tab = 'howItWorks' | 'faq'

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
      >
        <span className="font-sans text-sm text-text-primary leading-snug">{q}</span>
        <ChevronDown
          size={15}
          className={`flex-shrink-0 transition-transform duration-200 text-text-muted group-hover:text-text-secondary ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="font-sans text-sm text-text-secondary leading-relaxed pb-4 -mt-1">
          {a}
        </p>
      )}
    </div>
  )
}

interface Props {
  onClose: () => void
}

export default function HelpModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('howItWorks')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-lg overflow-hidden"
        style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0"
          style={{ height: '52px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="font-sans text-sm font-semibold text-text-primary tracking-wide">
            {help.title}
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-sm text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors duration-150"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex flex-shrink-0 px-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          {(['howItWorks', 'faq'] as Tab[]).map(t => {
            const label = t === 'howItWorks' ? help.tabs.howItWorks : help.tabs.faq
            const active = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative font-sans text-xs py-3 mr-5 tracking-wider transition-colors duration-150
                  ${active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
              >
                {label}
                <span
                  className={`absolute bottom-0 left-0 h-px w-full bg-gold origin-left transition-transform duration-200
                    ${active ? 'scale-x-100' : 'scale-x-0'}`}
                />
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {tab === 'howItWorks' ? (
            <div>
              <p className="font-sans text-sm text-text-secondary mb-6 leading-relaxed">
                {help.howItWorks.heading}
              </p>
              <div className="space-y-6">
                {help.howItWorks.steps.map(s => (
                  <div key={s.step} className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}
                    >
                      {s.step}
                    </div>
                    <div>
                      <p className="font-sans text-sm font-semibold text-text-primary leading-snug mb-1">{s.title}</p>
                      <p className="font-sans text-sm text-text-secondary leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              {help.faq.map(item => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
