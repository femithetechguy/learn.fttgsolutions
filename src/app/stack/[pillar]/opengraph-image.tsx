import { ImageResponse } from 'next/og'
import dataBi     from '../../../../data/pillars/data-bi.json'
import appDev     from '../../../../data/pillars/app-dev.json'
import philosophy from '../../../../data/pillars/philosophy.json'

export const runtime     = 'edge'
export const alt         = 'The Stack'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

const PILLARS: Record<string, typeof dataBi> = {
  'data-bi':    dataBi,
  'app-dev':    appDev,
  'philosophy': philosophy,
}

const PILLAR_COLORS: Record<string, string> = {
  'data-bi':    '#1D9E75',
  'app-dev':    '#378ADD',
  'philosophy': '#EF9F27',
}

export default function Image({ params }: { params: { pillar: string } }) {
  const data   = PILLARS[params.pillar]
  const accent = PILLAR_COLORS[params.pillar] ?? '#FBB040'

  if (!data) return new ImageResponse(<div>Not found</div>, size)

  const { headline, tagline } = data

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

        {/* Content area */}
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
              FTTG Learn · The Stack
            </span>
          </div>

          {/* Main headline row: icon + text */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {/* Layers icon */}
              <svg
                viewBox="0 0 24 24"
                width={88}
                height={88}
                fill="none"
                stroke={accent}
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, opacity: 0.9 }}
              >
                <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
                <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
              </svg>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 72,
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                }}
              >
                {headline}
              </div>
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 30,
                fontWeight: 400,
                letterSpacing: '0.04em',
              }}
            >
              {tagline}
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
