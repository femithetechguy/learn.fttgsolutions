import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const alt         = 'FTTG Learn — Build. Think. Grow.'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

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
        {/* Gold top bar */}
        <div style={{ width: '100%', height: 6, background: '#FBB040' }} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 80px 60px',
          }}
        >
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FBB040' }} />
            <span
              style={{
                color: '#FBB040',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              FTTG Learn
            </span>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                color: '#ffffff',
                fontSize: 88,
                fontWeight: 800,
                lineHeight: 1.0,
                letterSpacing: '-0.02em',
              }}
            >
              Build. Think. Grow.
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 28,
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}
            >
              Technical training and timeless philosophy for builders.
            </div>
          </div>

          {/* Domain */}
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
