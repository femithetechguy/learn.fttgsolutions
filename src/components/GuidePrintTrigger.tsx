'use client'

import { useEffect } from 'react'
import { Printer } from 'lucide-react'

export default function GuidePrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm rounded font-medium hover:bg-gray-800 transition-colors"
      style={{ backgroundImage: 'linear-gradient(180deg,rgba(255,255,255,0.12) 0%,rgba(0,0,0,0.12) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22),inset 0 -1px 0 rgba(0,0,0,0.55),inset 1px 0 0 rgba(255,255,255,0.08),inset -1px 0 0 rgba(0,0,0,0.18),0 2px 6px rgba(0,0,0,0.35)' }}
    >
      <Printer size={14} />
      Print
    </button>
  )
}
