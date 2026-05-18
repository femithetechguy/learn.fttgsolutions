'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { LogOut, Menu, X, HelpCircle } from 'lucide-react'
import Logo from '@/components/Logo'
import content from '@/lib/content'
import { ICON_MAP } from '@/components/FilterBar'
import HelpModal from '@/components/HelpModal'

interface NavProps {
  user?: { name?: string; role: 'member' | 'guest' | null }
  onLogout?: () => void
}

const { nav, ui } = content.dashboard

const NAV_LINKS = [
  { label: nav.courses,   href: nav.coursesUrl,   icon: nav.coursesIcon,   activeColor: 'text-text-primary', hoverColor: 'hover:text-text-primary' },
  { label: nav.stack,     href: nav.stackUrl,     icon: nav.stackIcon,     activeColor: 'text-text-primary', hoverColor: 'hover:text-text-primary' },
  { label: nav.articles,  href: nav.articlesUrl,  icon: nav.articlesIcon,  activeColor: 'text-text-primary', hoverColor: 'hover:text-text-primary' },
  { label: nav.resources, href: nav.resourcesUrl, icon: nav.resourcesIcon, activeColor: 'text-text-primary', hoverColor: 'hover:text-text-primary' },
  { label: nav.cheatsheets, href: nav.cheatsheetsUrl, icon: nav.cheatsheetsIcon, activeColor: 'text-text-primary', hoverColor: 'hover:text-text-primary' },
  { label: nav.favorites,   href: nav.favoritesUrl,   icon: nav.favoritesIcon,   activeColor: 'text-gold',         hoverColor: 'hover:text-gold' },
] as const

const STAGGER = ['', 'animate-delay-100', 'animate-delay-200', 'animate-delay-300'] as const

export default function Nav({ user, onLogout }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const pathname = usePathname()
  const isGuest = user?.role === 'guest'
  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : null

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-bg-primary/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo size="sm" />

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ label, href, icon, activeColor, hoverColor }) => {
              const Icon = ICON_MAP[icon]
              const active = isActive(href)
              return (
                <a
                  key={href}
                  href={href}
                  className={`group relative flex items-center gap-1.5 font-sans text-sm pb-0.5 transition-colors duration-200
                    ${active ? activeColor : `text-text-secondary ${hoverColor}`}`}
                >
                  {Icon && (
                    <Icon
                      size={14}
                      className="transition-transform duration-200 group-hover:-translate-y-px"
                    />
                  )}
                  {label}
                  <span
                    className={`absolute bottom-0 left-0 h-px w-full bg-current origin-left transition-transform duration-200
                      ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                  />
                </a>
              )
            })}
          </div>

          {/* User area */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setHelpOpen(true)}
              className="flex items-center justify-center w-7 h-7 text-text-muted hover:text-text-secondary transition-colors duration-200"
              aria-label="Help"
            >
              <HelpCircle size={16} />
            </button>
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
                    className="flex items-center gap-1.5 font-sans text-sm text-text-muted hover:text-text-secondary transition-colors duration-200"
                  >
                    <LogOut size={14} />
                    {isGuest ? ui.signIn : ui.signOut}
                  </button>
                )}
              </>
            ) : (
              <a href="/" className="font-sans text-sm font-medium text-text-primary border border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50 px-4 py-1.5 rounded-sm transition-all duration-200 bevel">
                {ui.signIn}
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden w-11 h-11 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors duration-200"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label={ui.toggleMenu}
          >
            <span className="transition-transform duration-200" style={{ display: 'contents' }}>
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </span>
          </button>
        </div>
      </div>

      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-bg-secondary px-4 py-4 space-y-1 animate-slide-up">
          {NAV_LINKS.map(({ label, href, icon, activeColor, hoverColor }, i) => {
            const Icon = ICON_MAP[icon]
            const active = isActive(href)
            return (
              <a
                key={href}
                href={href}
                className={`group flex items-center gap-2 font-sans text-sm py-2 px-2 -mx-2 rounded-sm
                  animate-slide-in-left ${STAGGER[i]}
                  transition-colors duration-150
                  ${active
                    ? `${activeColor} bg-white/5`
                    : `text-text-secondary ${hoverColor} hover:bg-white/5`
                  }`}
              >
                {Icon && (
                  <Icon
                    size={15}
                    className="transition-transform duration-150 group-hover:-translate-y-px"
                  />
                )}
                {label}
              </a>
            )
          })}
          <div className="pt-2 border-t border-white/5 space-y-1">
            <button
              onClick={() => { setMobileMenuOpen(false); setHelpOpen(true) }}
              className="flex items-center gap-2 font-sans text-sm text-text-muted hover:text-text-secondary transition-colors duration-150 py-2 px-2 -mx-2 w-full"
            >
              <HelpCircle size={15} />
              Help
            </button>
            {user && onLogout ? (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 font-sans text-sm text-text-muted hover:text-text-secondary transition-colors duration-150"
              >
                <LogOut size={14} />
                {isGuest ? ui.signIn : ui.signOut}
              </button>
            ) : (
              <a href="/" className="inline-flex font-sans text-sm font-medium text-text-primary border border-white/30 bg-white/5 hover:bg-white/10 hover:border-white/50 px-4 py-1.5 rounded-sm transition-all duration-150 bevel">
                {ui.signIn}
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
