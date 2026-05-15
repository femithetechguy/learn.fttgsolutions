'use client'

import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, BookOpen, Code2, Brain, Flame } from 'lucide-react'
import Logo from '@/components/Logo'
import content from '@/lib/content'

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  onGuest: () => void
}

const PILLAR_ICONS = { code: Code2, data: BookOpen, flame: Flame, brain: Brain } as const

const PILLARS = content.pillars.map(p => ({
  ...p,
  icon: PILLAR_ICONS[p.type as keyof typeof PILLAR_ICONS],
}))

const { login } = content

export default function LoginPage({ onLogin, onGuest }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [guestLoading, setGuestLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError(login.form.validationError)
      return
    }
    setError('')
    setLoading(true)
    const result = await onLogin(email, password)
    setLoading(false)
    if (!result.success) {
      setError(result.error || login.form.errorFallback)
    }
  }

  const handleGuest = async () => {
    setGuestLoading(true)
    await new Promise(r => setTimeout(r, 400))
    onGuest()
  }

  return (
    <div className="min-h-screen bg-bg-primary bg-grid flex">

      {/* Left panel — brand & pillars */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">

        {/* Floating ambient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent-dev/5 blur-3xl pointer-events-none animate-float-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 -right-16 w-64 h-64 rounded-full bg-accent-cross/5 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '5s' }} />

        {/* Top — logo + tagline */}
        <div className="relative z-10">
          <div className="animate-fade-in">
            <Logo size="lg" />
          </div>
          <div className="mt-10">
            <p className="font-sans text-text-muted text-sm tracking-widest uppercase mb-3 animate-slide-up animate-delay-100">
              {login.brand.siteLabel}
            </p>
            <h1 className="font-display text-5xl font-bold leading-tight text-text-primary">
              <span className="inline-block animate-slide-up animate-delay-200">{login.brand.headline[0]}</span>{' '}
              <span
                className="inline-block text-shimmer-gold"
                style={{ animation: 'slideUp 0.5s ease both 300ms, shimmer 3s linear 900ms infinite' }}
              >
                {login.brand.headline[1]}
              </span>
              <br />
              <span className="inline-block animate-slide-up animate-delay-400">{login.brand.headline[2]}</span>
            </h1>
            <p className="mt-4 font-sans text-text-secondary text-lg leading-relaxed max-w-md animate-slide-up animate-delay-500">
              {login.brand.subheading}
            </p>
          </div>
        </div>

        {/* Mid — 3 main pillars + Crossover connector */}
        <div className="relative z-10">
          <p className="font-sans text-text-muted text-xs tracking-widest uppercase mb-4 animate-fade-in animate-delay-500">
            {login.brand.pillarsLabel}
          </p>

          {/* Main pillars — 3 equal columns */}
          <div className="grid grid-cols-3 gap-2">
            {PILLARS.slice(0, 3).map(({ icon: Icon, label, tag, color, bg, type }, i) => (
              <div
                key={label}
                className="relative p-3 rounded-sm border border-white/5 bg-bg-card/50 backdrop-blur-sm group hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-slide-in-left overflow-hidden"
                style={{ animationDelay: `${600 + i * 120}ms` }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: `inset 0 0 20px ${color}15` }} />

                <div
                  className={`w-7 h-7 rounded-sm flex items-center justify-center mb-2.5 flex-shrink-0 ${type === 'flame' ? 'animate-flicker' : ''}`}
                  style={{ background: bg }}
                >
                  <Icon size={13} style={{ color }} />
                </div>

                {type === 'code' && (
                  <div className="font-mono text-[8px] leading-relaxed mb-2.5 h-7 overflow-hidden" style={{ color, opacity: 0.55 }}>
                    <div><span style={{ opacity: 0.5 }}>import</span> {'{ useState }'}</div>
                    <div><span style={{ opacity: 0.5 }}>const</span> {' App = () =>'}</div>
                    <div className="pl-1">{'<View'}<span className="animate-blink">▋</span></div>
                  </div>
                )}

                {type === 'data' && (
                  <div className="flex items-end gap-0.5 mb-2.5 h-7">
                    {[55, 85, 40, 95, 65].map((h, j) => (
                      <div
                        key={j}
                        className="flex-1 rounded-t-sm origin-bottom animate-grow-bar"
                        style={{ height: `${h}%`, background: color, opacity: 0.35 + h / 220, animationDelay: `${800 + j * 90}ms` }}
                      />
                    ))}
                  </div>
                )}

                {type === 'flame' && (
                  <div className="flex items-end gap-1.5 mb-2.5 h-7">
                    {[4, 6, 5, 8, 6, 9].map((size, j) => (
                      <div
                        key={j}
                        className="rounded-full animate-float"
                        style={{
                          width: size, height: size,
                          background: color,
                          opacity: 0.2 + j * 0.1,
                          animationDelay: `${j * 400}ms`,
                          animationDuration: `${3 + j * 0.4}s`,
                          alignSelf: j % 2 === 0 ? 'flex-end' : 'center',
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}

                <p className="font-sans font-semibold text-text-primary text-xs leading-tight">{label}</p>
                <p className="font-sans text-text-muted text-[9px] mt-0.5 leading-tight">{tag}</p>
              </div>
            ))}
          </div>

          {/* Crossover — full-width connector strip */}
          {(() => {
            const cx = PILLARS[3]
            return (
              <div
                className="relative mt-2 px-4 py-3 rounded-sm border border-accent-cross/25 bg-bg-card/30 backdrop-blur-sm group hover:border-accent-cross/40 transition-all duration-300 cursor-pointer animate-slide-in-left overflow-hidden"
                style={{ animationDelay: '960ms' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: 'inset 0 0 28px rgba(127,119,221,0.1)' }} />
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: cx.bg }}>
                    <Brain size={13} style={{ color: cx.color }} />
                  </div>
                  <div className="flex-shrink-0">
                    <p className="font-sans font-semibold text-text-primary text-xs">{cx.label}</p>
                    <p className="font-sans text-text-muted text-[9px]">{cx.tag}</p>
                  </div>
                  <div className="flex-1 flex items-center justify-end gap-2">
                    <div className="flex flex-col gap-0.5 text-right">
                      {PILLARS.slice(0, 3).map((p, j) => (
                        <span
                          key={p.label}
                          className="font-sans text-[8px] font-semibold animate-pulse"
                          style={{ color: p.color, opacity: 0.75, animationDelay: `${j * 400}ms` }}
                        >
                          {p.label}
                        </span>
                      ))}
                    </div>
                    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" className="flex-shrink-0">
                      <line x1="0" y1="5"  x2="22" y2="18" stroke="#7F77DD" strokeWidth="0.9" strokeOpacity="0.45" />
                      <line x1="0" y1="18" x2="22" y2="18" stroke="#7F77DD" strokeWidth="0.9" strokeOpacity="0.45" />
                      <line x1="0" y1="31" x2="22" y2="18" stroke="#7F77DD" strokeWidth="0.9" strokeOpacity="0.45" />
                      <polygon points="22,15 28,18 22,21" fill="#7F77DD" opacity="0.55" />
                    </svg>
                    <div
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 animate-pulse"
                      style={{ background: cx.color, boxShadow: `0 0 10px ${cx.color}B0`, animationDelay: '1.2s' }}
                    />
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Bottom — stats */}
        <div className="relative z-10 flex gap-8">
          {login.stats.map(({ value, label }, i) => (
            <div key={label} className="animate-scale-in" style={{ animationDelay: `${1060 + i * 130}ms` }}>
              <p className="font-display text-2xl font-bold text-gradient-gold">{value}</p>
              <p className="font-sans text-text-muted text-xs tracking-wide uppercase mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent" />

      {/* Right panel — login form */}
      <div className="flex-1 relative flex flex-col items-center justify-center px-6 py-12 lg:px-16 overflow-hidden">

        {/* Mobile ambient glow */}
        <div className="lg:hidden absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gold/4 blur-3xl pointer-events-none animate-float" />

        {/* Mobile logo */}
        <div className="lg:hidden mb-10 animate-fade-in">
          <Logo size="md" />
        </div>

        <div className="w-full max-w-[400px] animate-slide-up animate-delay-100">

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-text-primary leading-tight">
              {login.form.title}
            </h2>
            <p className="font-sans text-text-secondary mt-2 text-base">
              {login.form.subtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-text-secondary tracking-widest uppercase block">
                {login.form.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={login.form.emailPlaceholder}
                className="input-dark"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-sans text-xs font-semibold text-text-secondary tracking-widest uppercase block">
                {login.form.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={login.form.passwordPlaceholder}
                  className="input-dark pr-11"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="font-sans text-xs text-text-muted hover:text-gold transition-colors" tabIndex={-1}>
                {login.form.forgotPassword}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
                <span className="font-sans text-red-400 text-sm">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full mt-2 h-12 text-sm">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg-primary/30 border-t-bg-primary rounded-full animate-spin" />
                  {login.form.signingIn}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {login.form.signInButton}
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-text-muted/20" />
            <span className="font-sans text-text-muted text-xs tracking-widest uppercase">{login.form.divider}</span>
            <div className="flex-1 h-px bg-text-muted/20" />
          </div>

          <button
            type="button"
            onClick={handleGuest}
            disabled={guestLoading}
            className="btn-ghost w-full h-12 text-sm group"
          >
            {guestLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-text-muted/30 border-t-text-secondary rounded-full animate-spin" />
                {login.form.guestLoading}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {login.form.guestButton}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            )}
          </button>

          <p className="font-sans text-text-muted text-xs text-center mt-3 leading-relaxed">
            {login.form.guestNote}{' '}
            <button className="text-gold hover:text-gold-light transition-colors underline underline-offset-2">
              {login.form.createAccount}
            </button>{' '}
            {login.form.createAccountSuffix}
          </p>

          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <a
              href={content.site.mainSiteUrl}
              className="font-sans text-text-muted text-xs hover:text-text-secondary transition-colors inline-flex items-center gap-1.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              {login.form.backToSite}
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
