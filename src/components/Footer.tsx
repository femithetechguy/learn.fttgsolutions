'use client'

import { Youtube, Instagram, Twitter, Send } from 'lucide-react'
import Logo from '@/components/Logo'
import content from '@/lib/content'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-8 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          <div className="flex flex-col gap-3">
            <Logo size="sm" />
            <p className="font-sans text-text-muted text-sm leading-relaxed">
              {content.footer.brand.tagline}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="font-sans text-sm font-semibold text-text-primary mb-1">{content.footer.quickLinks.heading}</p>
            {content.footer.quickLinks.links.map(l => (
              <a key={l.label} href={l.href} className="font-sans text-sm text-text-muted hover:text-text-primary transition-colors"
                {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="font-sans text-sm font-semibold text-text-primary mb-1">{content.footer.company.heading}</p>
            {content.footer.company.links.map(l => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                className="font-sans text-sm text-text-muted hover:text-text-primary transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="font-sans text-sm font-semibold text-text-primary mb-1">{content.footer.newsletter.heading}</p>
            <p className="font-sans text-sm text-text-muted">{content.footer.newsletter.description}</p>
            <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-2 mt-1">
              <input type="email" placeholder={content.footer.newsletter.placeholder} className="input-dark text-sm py-2" />
              <button type="submit" className="btn-gold text-sm py-2 gap-2">
                <Send size={13} />
                {content.footer.newsletter.button}
              </button>
            </form>
          </div>

        </div>

        <div className="mt-8 pt-6 pb-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-text-secondary text-xs">{content.footer.copyright}</p>
          <div className="flex items-center gap-8 shrink-0">
            <a href={content.footer.social.youtube} target="_blank" rel="noopener noreferrer"
              aria-label={content.footer.social.youtubeLabel} className="text-text-secondary hover:text-gold transition-colors">
              <Youtube size={20} />
            </a>
            <a href={content.footer.social.instagram} target="_blank" rel="noopener noreferrer"
              aria-label={content.footer.social.instagramLabel} className="text-text-secondary hover:text-gold transition-colors">
              <Instagram size={20} />
            </a>
            <a href={content.footer.social.twitter} target="_blank" rel="noopener noreferrer"
              aria-label={content.footer.social.twitterLabel} className="text-text-secondary hover:text-gold transition-colors">
              <Twitter size={20} />
            </a>
            <a href={content.footer.social.tiktok} target="_blank" rel="noopener noreferrer"
              aria-label={content.footer.social.tiktokLabel} className="text-text-secondary hover:text-gold transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
