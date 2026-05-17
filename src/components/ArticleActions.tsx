'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Share2, Printer, Check } from 'lucide-react'

interface ArticleActionsProps {
  slug:  string
  title: string
}

export default function ArticleActions({ slug, title }: ArticleActionsProps) {
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title, url }) } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 1500)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-white/30 text-text-primary bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-150 font-sans text-xs font-medium bevel"
        title="Share this article"
      >
        {shared
          ? <><Check size={13} className="text-green-400" /><span className="text-green-400">Copied!</span></>
          : <><Share2 size={13} /><span className="hidden sm:inline">Share</span></>
        }
      </button>
      <Link
        href={`/articles/${slug}/print`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-white/30 text-text-primary bg-white/5 hover:bg-white/10 hover:border-white/50 transition-all duration-150 font-sans text-xs font-medium bevel"
        title="Print this article"
      >
        <Printer size={13} />
        <span className="hidden sm:inline">Print</span>
      </Link>
    </div>
  )
}
