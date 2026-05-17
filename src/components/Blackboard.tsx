'use client'

import React from 'react'

// Chalk style utilities — import these in any component rendered inside a Blackboard
export const CHALK      = "var(--font-chalk, 'Courier New', Courier, monospace)"
export const chalkColor = (a = 1)    => `rgba(232,228,208,${a})`
export const chalkGlow  = (a = 0.14) => `0 0 10px rgba(232,228,208,${a}), 0 1px 3px rgba(0,0,0,0.9)`

const MARKERS: { cap: string }[] = [
  { cap: '#1a1a1a' },
  { cap: '#cc2020' },
  { cap: '#1a36cc' },
  { cap: '#1a1a1a' },
]

interface BlackboardProps {
  children: React.ReactNode
  minHeight?: number
}

export default function Blackboard({ children, minHeight = 520 }: BlackboardProps) {
  return (
    <div
      className="w-full rounded-sm relative select-none"
      style={{
        background: 'linear-gradient(160deg, #7a4218 0%, #9a5220 18%, #8a4818 55%, #5c2e0a 100%)',
        padding: '28px 16px 0',
        boxShadow: [
          '0 20px 60px rgba(0,0,0,0.85)',
          'inset 0 1px 0 rgba(255,255,255,0.11)',
          'inset 0 -2px 4px rgba(0,0,0,0.6)',
          'inset 1px 0 0 rgba(255,255,255,0.06)',
          'inset -1px 0 0 rgba(0,0,0,0.45)',
        ].join(','),
      }}
    >
      {/* Eraser holder — centre top */}
      <div
        className="absolute z-30"
        style={{
          top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '60px', height: '22px',
          background: 'linear-gradient(180deg, #1c1c1c, #0a0a0a)',
          borderRadius: '0 0 5px 5px',
          boxShadow: '0 3px 8px rgba(0,0,0,0.8), inset 0 -1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div style={{ margin: '6px auto 0', width: '32px', height: '5px', background: '#333', borderRadius: '2px' }} />
      </div>

      {/* Marker resting on top ledge */}
      <div className="absolute z-30 flex" style={{ top: '6px', right: '80px' }}>
        <ExpoMarker cap="#222" />
      </div>

      {/* Top corner screws */}
      <Screw style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 20 }} />
      <Screw style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20 }} />

      {/* Board surface */}
      <div
        style={{
          minHeight: `${minHeight}px`,
          background: 'linear-gradient(155deg, #131715 0%, #0c1110 45%, #101310 100%)',
          borderRadius: '2px',
          boxShadow: 'inset 0 2px 12px rgba(0,0,0,0.7), inset 0 0 60px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Chalk-dust smears */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: [
            'radial-gradient(ellipse 200px 80px at 10% 20%, rgba(255,255,255,0.012) 0%, transparent 100%)',
            'radial-gradient(ellipse 150px 60px at 78% 65%, rgba(255,255,255,0.009) 0%, transparent 100%)',
          ].join(','),
        }} />

        <div className="relative z-10 px-7 pt-6 pb-10" style={{ fontFamily: CHALK }}>
          {children}
        </div>
      </div>

      {/* Marker tray */}
      <div
        className="relative"
        style={{
          height: '48px',
          background: 'linear-gradient(180deg, #7a4015 0%, #5a2e0c 55%, #3a1e06 100%)',
          borderTop: '3px solid rgba(0,0,0,0.6)',
          borderRadius: '0 0 3px 3px',
          boxShadow: 'inset 0 5px 12px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="absolute" style={{
          top: '9px', left: '8px', right: '8px', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(232,228,208,0.06) 15%, rgba(232,228,208,0.05) 85%, transparent)',
        }} />

        <Screw style={{ position: 'absolute', bottom: '10px', left: '8px', zIndex: 20 }} />
        <Screw style={{ position: 'absolute', bottom: '10px', right: '8px', zIndex: 20 }} />

        <div className="flex items-center overflow-hidden" style={{ height: '100%', paddingLeft: '18px', paddingRight: '16px', gap: '12px' }}>
          <BoardEraser />
          {MARKERS.map((m, i) => (
            <div key={i} className={i >= 2 ? 'hidden sm:block' : 'block'}>
              <ExpoMarker cap={m.cap} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Screw({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{
      width: '12px', height: '12px', borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 30%, #b8a888, #3c2c1c)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <div style={{ width: '55%', height: '1.5px', background: 'rgba(0,0,0,0.5)', borderRadius: '1px', transform: 'rotate(45deg)' }} />
    </div>
  )
}

function BoardEraser() {
  return (
    <div style={{
      width: '78px', height: '28px', flexShrink: 0,
      background: 'linear-gradient(180deg, #2a2a2a 0%, #181818 100%)',
      borderRadius: '4px',
      boxShadow: '0 3px 8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', bottom: 0, left: '3px', right: '3px', height: '9px',
        background: 'linear-gradient(180deg, #3a2c20, #2a1c10)',
        borderRadius: '0 0 2px 2px',
      }} />
      <div style={{
        position: 'absolute', top: '4px', left: '8px', right: '8px', height: '2px',
        background: 'rgba(255,255,255,0.07)', borderRadius: '1px',
      }} />
    </div>
  )
}

function ExpoMarker({ cap, bodyWidth = 70 }: { cap: string; bodyWidth?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '15px', flexShrink: 0 }}>
      <div style={{
        width: '16px', height: '15px',
        background: `linear-gradient(180deg, ${cap}cc 0%, ${cap} 100%)`,
        borderRadius: '4px 0 0 4px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.35)',
      }} />
      <div style={{
        width: `${bodyWidth}px`, height: '13px',
        background: 'linear-gradient(180deg, #f4f4f4 0%, #d4d4d4 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.18)',
      }}>
        {bodyWidth >= 50 && (
          <span style={{ fontSize: '6px', fontWeight: 900, color: '#444', letterSpacing: '1.5px', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
            expo
          </span>
        )}
      </div>
      <div style={{
        width: '7px', height: '9px',
        background: '#2a2a2a',
        borderRadius: '0 3px 3px 0',
        marginTop: '3px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }} />
    </div>
  )
}
