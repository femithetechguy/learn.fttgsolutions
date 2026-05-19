import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const alt         = 'Guides — FTTG Learn'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ACCENT = '#D4AF37'

export default function Image() {
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
        <div style={{ width: '100%', height: 6, background: ACCENT }} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 80px 60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: ACCENT }} />
            <span
              style={{
                color: ACCENT,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              FTTG Learn · Guides
            </span>
          </div>

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
              Guides
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 26,
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: 860,
              }}
            >
              Deep-dives, walkthroughs, and interview prep from the FTTG crew.
            </div>
          </div>

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
