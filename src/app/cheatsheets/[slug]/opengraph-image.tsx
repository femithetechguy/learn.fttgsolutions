import { ImageResponse } from 'next/og'
import { SHEETS } from '../../../../data/cheatsheets/registry'

export const runtime     = 'edge'
export const alt         = 'Cheat Sheet'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image({ params }: { params: { slug: string } }) {
  const sheet = SHEETS.find(s => s.key === params.slug)
  if (!sheet) return new ImageResponse(<div>Not found</div>, size)

  const { headline, tagline, color } = sheet.data
  const accent = `#${color}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0d0d0f',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {/* Color dot */}
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: accent,
              }}
            />
            <span
              style={{
                color: accent,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              FTTG Learn · Cheat Sheets
            </span>
          </div>

          {/* Main headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                color: '#ffffff',
                fontSize: 80,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              {headline}
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
