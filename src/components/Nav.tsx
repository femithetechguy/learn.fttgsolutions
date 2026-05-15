'use client'

import { useState } from 'react'
import { LogOut, Menu, X, Heart } from 'lucide-react'
import Logo from '@/components/Logo'
import content from '@/lib/content'

interface NavProps {
  user?: { name?: string; role: 'member' | 'guest' | null }
  onLogout?: () => void
}

const { nav, ui } = content.dashboard

export default function Nav({ user, onLogout }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isGuest = user?.role === 'guest'
  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : null

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="sm" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <a href={nav.coursesUrl} className="font-sans text-sm text-text-secondary hover:text-text-primary transition-colors">{nav.courses}</a>
            <a href={nav.articlesUrl} className="font-sans text-sm text-text-secondary hover:text-text-primary transition-colors">{nav.articles}</a>
            <a href={nav.resourcesUrl} className="font-sans text-sm text-text-secondary hover:text-text-primary transition-colors">{nav.resources}</a>
            <a href="/favorites" aria-label="Favourites" className="text-text-secondary hover:text-gold transition-colors">
              <Heart size={17} />
            </a>
          </div>

          {/* User area */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {isGuest ? (
                  <span className="tag-pill bg-gold-muted text-gold border border-gold-border text-xs">{ui.guestBadge}</span>
                ) : (
                  <span className="font-sans text-sm text-text-secondary">{displayName}</span>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 font-sans text-xs text-text-muted hover:text-text-secondary transition-colors"
                  >
                    <LogOut size={14} />
                    {isGuest ? ui.signIn : ui.signOut}
                  </button>
                )}
              </>
            ) : (
              <a href="/" className="font-sans text-xs text-text-muted hover:text-text-secondary transition-colors">
                {ui.signIn}
              </a>
            )}
          </div>

          {/* Mobile menu button — 44×44px touch target */}
          <button
            className="md:hidden w-11 h-11 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label={ui.toggleMenu}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-bg-secondary px-4 py-4 space-y-3">
          <a href={nav.coursesUrl} className="block font-sans text-sm text-text-secondary py-1">{nav.courses}</a>
          <a href={nav.articlesUrl} className="block font-sans text-sm text-text-secondary py-1">{nav.articles}</a>
          <a href={nav.resourcesUrl} className="block font-sans text-sm text-text-secondary py-1">{nav.resources}</a>
          <a href="/favorites" className="block font-sans text-sm text-text-secondary py-1">Favourites</a>
          <div className="pt-2 border-t border-white/5">
            {user && onLogout ? (
              <button onClick={onLogout} className="flex items-center gap-2 font-sans text-sm text-text-muted">
                <LogOut size={14} />
                {isGuest ? ui.signIn : ui.signOut}
              </button>
            ) : (
              <a href="/" className="font-sans text-sm text-text-muted">{ui.signIn}</a>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
