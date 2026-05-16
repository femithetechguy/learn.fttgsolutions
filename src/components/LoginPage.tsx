'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'
import { ICON_MAP } from '@/components/FilterBar'
import content from '@/lib/content'

type View = 'login' | 'register' | 'forgot'

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  onGuest: () => void
  onRegister?: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  onForgotPassword?: (email: string) => Promise<{ success: boolean; error?: string }>
}

const PILLARS = content.pillars.map(p => ({
  ...p,
  Icon: p.icon ? ICON_MAP[p.icon] : null,
}))

const { login } = content
const reg = login.register
const forgot = login.forgot

function PillarCards({ mobile = false }: { mobile?: boolean }) {
  const cx = PILLARS[3]

  // ── Mobile: left column = 3 stacked pillars, right column = crossover ──
  if (mobile) {
    return (
      <div className="flex gap-1.5">

        {/* Left: 3 pillars stacked */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          {PILLARS.slice(0, 3).map(({ Icon, label, tag, color, bg, icon }, i) => (
            <div
              key={label}
              className="relative p-2 rounded-sm border border-white/5 bg-bg-card/50 backdrop-blur-sm animate-slide-in-left overflow-hidden"
              style={{ animationDelay: `${600 + i * 120}ms` }}
            >
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: `inset 0 0 20px ${color}08` }} />

              {/* Icon + decoration side-by-side */}
              <div className="flex items-start gap-1.5 mb-1.5">
                <div
                  className={`w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0 ${icon === 'Flame' ? 'animate-flicker' : ''}`}
                  style={{ background: bg }}
                >
                  <Icon size={10} style={{ color }} />
                </div>

                {icon === 'Code2' && (
                  <div className="font-mono text-[6px] leading-tight flex-1 overflow-hidden" style={{ color, opacity: 0.55 }}>
                    <div><span style={{ opacity: 0.5 }}>import</span> {'{ useState }'}</div>
                    <div><span style={{ opacity: 0.5 }}>const</span> {' App = () =>'}</div>
                  </div>
                )}
                {icon === 'BookOpen' && (
                  <div className="flex items-end gap-0.5 flex-1 h-5">
                    {[55, 85, 40, 95, 65].map((h, j) => (
                      <div key={j} className="flex-1 rounded-t-sm origin-bottom animate-grow-bar"
                        style={{ height: `${h}%`, background: color, opacity: 0.35 + h / 220, animationDelay: `${800 + j * 90}ms` }} />
                    ))}
                  </div>
                )}
                {icon === 'Flame' && (
                  <div className="flex items-center gap-0.5 flex-1 h-5">
                    {[3, 4, 3, 5, 4].map((size, j) => (
                      <div key={j} className="rounded-full animate-float"
                        style={{ width: size, height: size, background: color, opacity: 0.2 + j * 0.12,
                          animationDelay: `${j * 400}ms`, animationDuration: `${3 + j * 0.4}s`, flexShrink: 0 }} />
                    ))}
                  </div>
                )}
              </div>

              <p className="font-sans font-semibold text-text-primary text-xs leading-tight">{label}</p>
              <p className="font-sans text-text-muted text-[8px] mt-0.5 leading-tight">{tag}</p>
            </div>
          ))}
        </div>

        {/* Right: Crossover as tall vertical column */}
        <div
          className="relative w-[38%] flex-shrink-0 p-2 rounded-sm border border-accent-cross/25 bg-bg-card/30 backdrop-blur-sm animate-slide-in-left flex flex-col items-center overflow-hidden"
          style={{ animationDelay: '960ms' }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 28px rgba(127,119,221,0.08)' }} />

          {/* Icon */}
          <div className="w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: cx.bg }}>
            {cx.Icon && <cx.Icon size={10} style={{ color: cx.color }} />}
          </div>
          <p className="font-sans font-semibold text-text-primary text-xs leading-tight mt-1.5 text-center">{cx.label}</p>
          <p className="font-sans text-text-muted text-[7px] leading-tight mt-0.5 text-center">{cx.tag}</p>

          <div className="flex-1" />

          {/* Pillar names → convergence → circle */}
          <div className="flex flex-col items-center gap-0.5 mb-1">
            {PILLARS.slice(0, 3).map((p, j) => (
              <span key={p.label} className="font-sans text-[7px] font-semibold animate-pulse"
                style={{ color: p.color, opacity: 0.8, animationDelay: `${j * 400}ms` }}>
                {p.label}
              </span>
            ))}
          </div>
          <svg width="14" height="13" viewBox="0 0 14 13" fill="none" className="flex-shrink-0">
            <line x1="7" y1="0" x2="7" y2="7" stroke="#7F77DD" strokeWidth="1" strokeOpacity="0.5" />
            <polygon points="4,7 7,12 10,7" fill="#7F77DD" opacity="0.6" />
          </svg>
          <div className="w-3 h-3 rounded-full flex-shrink-0 animate-pulse mt-1"
            style={{ background: cx.color, boxShadow: `0 0 8px ${cx.color}B0`, animationDelay: '1.2s' }} />
        </div>
      </div>
    )
  }

  // ── Desktop: 3-col grid + full-width crossover strip ──
  return (
    <div>
      <div className="grid gap-2 grid-cols-3">
        {PILLARS.slice(0, 3).map(({ Icon, label, tag, color, bg, icon }, i) => (
          <div
            key={label}
            className="relative p-3 rounded-sm border border-white/5 bg-bg-card/50 backdrop-blur-sm group hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-slide-in-left overflow-hidden"
            style={{ animationDelay: `${600 + i * 120}ms` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: `inset 0 0 20px ${color}15` }} />

            <div
              className={`w-7 h-7 rounded-sm flex items-center justify-center mb-2.5 flex-shrink-0 ${icon === 'Flame' ? 'animate-flicker' : ''}`}
              style={{ background: bg }}
            >
              <Icon size={13} style={{ color }} />
            </div>

            {icon === 'Code2' && (
              <div className="font-mono text-[8px] leading-relaxed mb-2.5 h-7 overflow-hidden" style={{ color, opacity: 0.55 }}>
                <div><span style={{ opacity: 0.5 }}>import</span> {'{ useState }'}</div>
                <div><span style={{ opacity: 0.5 }}>const</span> {' App = () =>'}</div>
                <div className="pl-1">{'<View'}<span className="animate-blink">▋</span></div>
              </div>
            )}
            {icon === 'BookOpen' && (
              <div className="flex items-end gap-0.5 mb-2.5 h-7">
                {[55, 85, 40, 95, 65].map((h, j) => (
                  <div key={j} className="flex-1 rounded-t-sm origin-bottom animate-grow-bar"
                    style={{ height: `${h}%`, background: color, opacity: 0.35 + h / 220, animationDelay: `${800 + j * 90}ms` }} />
                ))}
              </div>
            )}
            {icon === 'Flame' && (
              <div className="flex items-end gap-1.5 mb-2.5 h-7">
                {[4, 6, 5, 8, 6, 9].map((size, j) => (
                  <div key={j} className="rounded-full animate-float"
                    style={{ width: size, height: size, background: color, opacity: 0.2 + j * 0.1,
                      animationDelay: `${j * 400}ms`, animationDuration: `${3 + j * 0.4}s`,
                      alignSelf: j % 2 === 0 ? 'flex-end' : 'center', flexShrink: 0 }} />
                ))}
              </div>
            )}

            <p className="font-sans font-semibold text-text-primary text-xs leading-tight">{label}</p>
            <p className="font-sans text-text-muted text-[9px] mt-0.5 leading-tight">{tag}</p>
          </div>
        ))}
      </div>

      {/* Crossover — full-width connector strip */}
      <div
        className="relative mt-2 px-4 py-3 rounded-sm border border-accent-cross/25 bg-bg-card/30 backdrop-blur-sm group hover:border-accent-cross/40 transition-all duration-300 cursor-pointer animate-slide-in-left overflow-hidden"
        style={{ animationDelay: '960ms' }}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ boxShadow: 'inset 0 0 28px rgba(127,119,221,0.1)' }} />
        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: cx.bg }}>
            {cx.Icon && <cx.Icon size={13} style={{ color: cx.color }} />}
          </div>
          <div className="flex-shrink-0">
            <p className="font-sans font-semibold text-text-primary text-xs">{cx.label}</p>
            <p className="font-sans text-text-muted text-[9px]">{cx.tag}</p>
          </div>
          <div className="flex-1 flex items-center justify-end gap-2">
            <div className="flex flex-col gap-0.5 text-right">
              {PILLARS.slice(0, 3).map((p, j) => (
                <span key={p.label} className="font-sans text-[8px] font-semibold animate-pulse"
                  style={{ color: p.color, opacity: 0.75, animationDelay: `${j * 400}ms` }}>
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
            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: cx.color, boxShadow: `0 0 10px ${cx.color}B0`, animationDelay: '1.2s' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage({ onLogin, onGuest, onRegister, onForgotPassword }: LoginPageProps) {
  const [view, setView]             = useState<View>('login')

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('view')
    if (p === 'register' || p === 'forgot') setView(p)
  }, [])

  // shared
  const [email, setEmail]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  // login
  const [password, setPassword]     = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)

  // register
  const [name, setName]             = useState('')
  const [regPassword, setRegPassword]   = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // forgot
  const [forgotSent, setForgotSent] = useState(false)

  const switchView = (v: View) => {
    setView(v)
    setError('')
    setForgotSent(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError(login.form.validationError); return }
    setError(''); setLoading(true)
    const result = await onLogin(email, password)
    setLoading(false)
    if (!result.success) setError(result.error || login.form.errorFallback)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !regPassword || !confirmPassword) { setError(reg.validationError); return }
    if (regPassword !== confirmPassword) { setError(reg.passwordMismatch); return }
    setError(''); setLoading(true)
    const result = await (onRegister?.(name, email, regPassword) ?? Promise.resolve({ success: true as const }))
    setLoading(false)
    if (!result.success) setError((result as { success: false; error?: string }).error || reg.errorFallback)
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { setError(login.form.validationError); return }
    setError(''); setLoading(true)
    await (onForgotPassword?.(email) ?? Promise.resolve({ success: true }))
    setLoading(false)
    setForgotSent(true)
  }

  const handleGuest = async () => {
    setGuestLoading(true)
    await new Promise(r => setTimeout(r, 400))
    onGuest()
  }

  return (
    <div className="h-dvh bg-bg-primary bg-grid flex overflow-hidden">

      {/* ── LEFT PANEL (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">

        {/* Floating ambient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-accent-dev/5 blur-3xl pointer-events-none animate-float-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 -right-16 w-64 h-64 rounded-full bg-accent-cross/5 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '5s' }} />

        {/* Top — logo + headline */}
        <div className="relative z-10">
          <div className="animate-fade-in"><Logo size="lg" /></div>
          <div className="mt-10">
            <p className="font-sans text-text-muted text-sm tracking-widest uppercase mb-3 animate-slide-up animate-delay-100">
              {login.brand.siteLabel}
            </p>
            <h1 className="font-display text-5xl font-bold leading-tight text-text-primary">
              <span className="inline-block animate-slide-up animate-delay-200">{login.brand.headline[0]}</span>{' '}
              <span className="inline-block text-shimmer-gold" style={{ animation: 'slideUp 0.5s ease both 300ms, shimmer 3s linear 900ms infinite' }}>
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

        {/* Mid — pillars */}
        <div className="relative z-10">
          <p className="font-sans text-text-muted text-xs tracking-widest uppercase mb-4 animate-fade-in animate-delay-500">
            {login.brand.pillarsLabel}
          </p>
          <PillarCards />
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

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 relative flex flex-col items-center lg:justify-center px-5 py-4 lg:py-12 lg:px-16 overflow-hidden">

        {/* Floating orb — mobile only */}
        <div className="lg:hidden absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gold/4 blur-3xl pointer-events-none animate-float" />

        {/* ── FORM ── */}
        <div className="w-full max-w-[400px] animate-slide-up animate-delay-100 relative z-10">

          {/* Logo — mobile only */}
          <div className="lg:hidden flex justify-center mb-5 animate-fade-in">
            <Logo size="sm" />
          </div>

          {/* ── LOGIN VIEW ── */}
          {view === 'login' && (
            <>
              <div className="mb-3 lg:mb-8">
                <h2 className="font-display text-xl lg:text-3xl font-bold text-text-primary leading-tight">
                  {login.form.title}
                </h2>
                <p className="hidden lg:block font-sans text-text-secondary mt-2 text-base">
                  {login.form.subtitle}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-2.5 lg:space-y-4" noValidate>
                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold text-text-secondary tracking-widest uppercase block">
                    {login.form.emailLabel}
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={login.form.emailPlaceholder}
                    className="input-dark !py-2 lg:!py-3"
                    autoComplete="email" disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold text-text-secondary tracking-widest uppercase block">
                    {login.form.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={login.form.passwordPlaceholder}
                      className="input-dark !py-2 lg:!py-3 pr-11"
                      autoComplete="current-password" disabled={loading}
                    />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                      tabIndex={-1} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button type="button" onClick={() => switchView('forgot')}
                    className="font-sans text-sm text-text-muted hover:text-gold transition-colors">
                    {login.form.forgotPassword}
                  </button>
                </div>

                {error && <ErrorBanner message={error} />}

                <button type="submit" disabled={loading} className="btn-gold w-full mt-1 h-10 lg:h-12 text-sm">
                  {loading
                    ? <Spinner label={login.form.signingIn} />
                    : <span className="flex items-center gap-2">{login.form.signInButton}<ArrowRight size={16} /></span>}
                </button>
              </form>

              <div className="flex items-center gap-3 my-3 lg:my-5">
                <div className="flex-1 h-px bg-text-muted/20" />
                <span className="font-sans text-text-muted text-xs tracking-widest uppercase">{login.form.divider}</span>
                <div className="flex-1 h-px bg-text-muted/20" />
              </div>

              <button type="button" onClick={handleGuest} disabled={guestLoading} className="btn-ghost w-full h-10 lg:h-12 text-sm group">
                {guestLoading
                  ? <Spinner label={login.form.guestLoading} muted />
                  : <span className="flex items-center gap-2">{login.form.guestButton}<ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>}
              </button>

              <div className="mt-4 space-y-1 text-center">
                <p className="font-sans text-text-muted text-sm leading-relaxed">
                  {login.form.guestNote}
                </p>
                <button onClick={() => switchView('register')}
                  className="font-sans text-sm text-gold hover:text-gold-light transition-colors underline underline-offset-2">
                  {login.form.createAccount}
                </button>
              </div>

              <div className="hidden lg:block mt-10 pt-6 border-t border-white/5 text-center">
                <a href={content.site.mainSiteUrl}
                  className="font-sans text-text-muted text-xs hover:text-text-secondary transition-colors inline-flex items-center gap-1.5"
                  target="_blank" rel="noopener noreferrer">
                  {login.form.backToSite}
                </a>
              </div>
            </>
          )}

          {/* ── REGISTER VIEW ── */}
          {view === 'register' && (
            <>
              <div className="mb-3 lg:mb-8">
                <h2 className="font-display text-xl lg:text-3xl font-bold text-text-primary leading-tight">
                  {reg.title}
                </h2>
                <p className="hidden lg:block font-sans text-text-secondary mt-2 text-base">
                  {reg.subtitle}
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-2.5 lg:space-y-4" noValidate>
                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold text-text-secondary tracking-widest uppercase block">
                    {reg.nameLabel}
                  </label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder={reg.namePlaceholder}
                    className="input-dark !py-2 lg:!py-3"
                    autoComplete="name" disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold text-text-secondary tracking-widest uppercase block">
                    {reg.emailLabel}
                  </label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder={login.form.emailPlaceholder}
                    className="input-dark !py-2 lg:!py-3"
                    autoComplete="email" disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold text-text-secondary tracking-widest uppercase block">
                    {reg.passwordLabel}
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'} value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder={login.form.passwordPlaceholder}
                      className="input-dark !py-2 lg:!py-3 pr-11"
                      autoComplete="new-password" disabled={loading}
                    />
                    <button type="button" onClick={() => setShowRegPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                      tabIndex={-1} aria-label={showRegPassword ? 'Hide password' : 'Show password'}>
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-sans text-xs font-semibold text-text-secondary tracking-widest uppercase block">
                    {reg.confirmPasswordLabel}
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder={login.form.passwordPlaceholder}
                    className="input-dark !py-2 lg:!py-3"
                    autoComplete="new-password" disabled={loading}
                  />
                </div>

                {error && <ErrorBanner message={error} />}

                <button type="submit" disabled={loading} className="btn-gold w-full mt-1 h-10 lg:h-12 text-sm">
                  {loading
                    ? <Spinner label={reg.submitting} />
                    : <span className="flex items-center gap-2">{reg.submitButton}<ArrowRight size={16} /></span>}
                </button>
              </form>

              <p className="font-sans text-text-muted text-sm text-center mt-4">
                {reg.backToLogin}{' '}
                <button onClick={() => switchView('login')} className="text-gold hover:text-gold-light transition-colors underline underline-offset-2">
                  {reg.backToLoginLink}
                </button>
              </p>
            </>
          )}

          {/* ── FORGOT PASSWORD VIEW ── */}
          {view === 'forgot' && (
            <>
              {forgotSent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-4">
                    <ArrowRight size={20} className="text-gold rotate-[-90deg]" />
                  </div>
                  <h2 className="font-display text-xl lg:text-2xl font-bold text-text-primary">{forgot.successTitle}</h2>
                  <p className="font-sans text-text-secondary text-sm mt-2 max-w-xs mx-auto">{forgot.successMessage}</p>
                  <button onClick={() => switchView('login')}
                    className="mt-6 font-sans text-sm text-gold hover:text-gold-light transition-colors underline underline-offset-2">
                    {forgot.backToLogin}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-3 lg:mb-8">
                    <h2 className="font-display text-xl lg:text-3xl font-bold text-text-primary leading-tight">
                      {forgot.title}
                    </h2>
                    <p className="hidden lg:block font-sans text-text-secondary mt-2 text-base">
                      {forgot.subtitle}
                    </p>
                  </div>

                  <form onSubmit={handleForgot} className="space-y-2.5 lg:space-y-4" noValidate>
                    <div className="space-y-1">
                      <label className="font-sans text-xs font-semibold text-text-secondary tracking-widest uppercase block">
                        {forgot.emailLabel}
                      </label>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder={login.form.emailPlaceholder}
                        className="input-dark !py-2 lg:!py-3"
                        autoComplete="email" disabled={loading}
                      />
                    </div>

                    {error && <ErrorBanner message={error} />}

                    <button type="submit" disabled={loading} className="btn-gold w-full mt-1 h-10 lg:h-12 text-sm">
                      {loading
                        ? <Spinner label={forgot.submitting} />
                        : <span className="flex items-center gap-2">{forgot.submitButton}<ArrowRight size={16} /></span>}
                    </button>
                  </form>

                  <p className="font-sans text-text-muted text-sm text-center mt-4">
                    <button onClick={() => switchView('login')} className="text-gold hover:text-gold-light transition-colors underline underline-offset-2">
                      {forgot.backToLogin}
                    </button>
                  </p>
                </>
              )}
            </>
          )}

        </div>

        {/* ── MOBILE BRAND SECTION (below form, login view only) ── */}
        {view === 'login' && (
          <div className="lg:hidden w-full max-w-[440px] mt-3 relative z-10">
            <div className="gold-line mb-3" />
            <div className="mb-2">
              <p className="font-sans text-text-muted text-[9px] tracking-widest uppercase mb-1 animate-slide-up animate-delay-100">
                {login.brand.siteLabel}
              </p>
              <h2 className="font-display text-2xl font-bold leading-tight text-text-primary">
                <span className="inline-block animate-slide-up animate-delay-200">{login.brand.headline[0]}</span>{' '}
                <span className="inline-block text-shimmer-gold" style={{ animation: 'slideUp 0.5s ease both 300ms, shimmer 3s linear 900ms infinite' }}>
                  {login.brand.headline[1]}
                </span>{' '}
                <span className="inline-block animate-slide-up animate-delay-400">{login.brand.headline[2]}</span>
              </h2>
            </div>
            <p className="font-sans text-text-muted text-[9px] tracking-widest uppercase mb-1.5 animate-fade-in animate-delay-500">
              {login.brand.pillarsLabel}
            </p>
            <PillarCards mobile />
            <div className="flex gap-5 mt-2">
              {login.stats.map(({ value, label }, i) => (
                <div key={label} className="animate-scale-in" style={{ animationDelay: `${1060 + i * 130}ms` }}>
                  <p className="font-display text-base font-bold text-gradient-gold">{value}</p>
                  <p className="font-sans text-text-muted text-[8px] tracking-wide uppercase mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-sm">
      <span className="font-sans text-red-400 text-sm">{message}</span>
    </div>
  )
}

function Spinner({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`w-4 h-4 border-2 rounded-full animate-spin ${muted ? 'border-text-muted/30 border-t-text-secondary' : 'border-bg-primary/30 border-t-bg-primary'}`} />
      {label}
    </span>
  )
}
