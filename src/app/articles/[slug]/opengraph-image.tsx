import { ImageResponse } from 'next/og'
import { ARTICLES } from '@/lib/articles'

export const runtime     = 'edge'
export const alt         = 'Article'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PILLAR_LABELS: Record<string, string> = {
  'data-bi':    'Data & BI',
  'app-dev':    'App Dev',
  'philosophy': 'Philosophy',
}

const PILLAR_COLORS: Record<string, string> = {
  'data-bi':    '#1D9E75',
  'app-dev':    '#378ADD',
  'philosophy': '#EF9F27',
}

export default function Image({ params }: { params: { slug: string } }) {
  const article = ARTICLES.find(a => a.slug === params.slug)
  if (!article) return new ImageResponse(<div>Not found</div>, size)

  const accent = PILLAR_COLORS[article.pillar] ?? '#D4AF37'
  const pillar = PILLAR_LABELS[article.pillar] ?? article.pillar

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0d0d0f',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div style={{ width: '100%', height: 6, background: accent }} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 80px 60px',
          }}
        >
          {/* Top label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: accent }} />
            <span
              style={{
                color: accent,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              FTTG Learn · {pillar}
            </span>
          </div>

          {/* Headline + subtitle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                color: '#ffffff',
                fontSize: article.title.length > 30 ? 60 : 72,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {article.title}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 26,
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: 900,
              }}
            >
              {article.subtitle}
            </div>
          </div>

          {/* Bottom domain */}
          <div
            style={{
              color: 'rgba(255,255,255,0.25)',
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: '0.06em',
            }}
          >
            learn.fttgsolutions.com
          </div>
        </div>
      </div>
    ),
    size,
  )
}
