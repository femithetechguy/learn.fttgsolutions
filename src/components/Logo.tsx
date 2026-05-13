import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showLearn?: boolean
  href?: string
}

export default function Logo({ size = 'md', showLearn = true, href = '/' }: LogoProps) {
  const sizes = {
    sm: { mark: 'text-xs', brand: 'text-base', learn: 'text-xs' },
    md: { mark: 'text-xs', brand: 'text-lg', learn: 'text-sm' },
    lg: { mark: 'text-sm', brand: 'text-2xl', learn: 'text-base' },
  }

  const s = sizes[size]

  return (
    <Link href={href} className="flex items-center gap-2.5 group select-none">
      {/* Mark */}
      <div className="flex items-center justify-center w-8 h-8 bg-gold rounded-sm flex-shrink-0 transition-all duration-200 group-hover:bg-gold-light">
        <span className={`font-display font-bold text-bg-primary ${s.mark} leading-none`}>F</span>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display font-bold text-text-primary ${s.brand} tracking-tight`}>
            FTTG
          </span>
          {showLearn && (
            <span className={`font-sans font-semibold text-gold ${s.learn} tracking-widest uppercase`}>
              Learn
            </span>
          )}
        </div>
        <span className="font-sans text-text-muted text-[10px] tracking-widest uppercase mt-0.5">
          Solutions
        </span>
      </div>
    </Link>
  )
}
