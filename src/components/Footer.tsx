import { Youtube, Instagram, Twitter, Send } from 'lucide-react'
import Logo from '@/components/Logo'
import content from '@/lib/content'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-8 bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem' }}>

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
          </div>
        </div>

      </div>
    </footer>
  )
}
