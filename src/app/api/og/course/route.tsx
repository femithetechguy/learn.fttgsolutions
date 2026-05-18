import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { findLessonBySlug } from '@/lib/lesson-slug'
import type { CourseDetail } from '@/components/CourseBlackboard'

export const runtime = 'edge'

const SIZE = { width: 1200, height: 630 }

import buildersPhilosophy    from '../../../../../data/courses/detail/builders-philosophy.json'
import daxZeroToAdvanced     from '../../../../../data/courses/detail/dax-zero-to-advanced.json'
import nestjsApiArchitecture from '../../../../../data/courses/detail/nestjs-api-architecture.json'
import nextjsPersonalBrand   from '../../../../../data/courses/detail/nextjs-personal-brand-site.json'
import pythonEtlForPowerBi   from '../../../../../data/courses/detail/python-etl-for-power-bi.json'
import theCrossoverSeries    from '../../../../../data/courses/detail/the-crossover-series.json'
import thinkAndBuildRich     from '../../../../../data/courses/detail/think-and-build-rich.json'

const COURSES: Record<string, CourseDetail> = {
  'builders-philosophy':      buildersPhilosophy    as CourseDetail,
  'dax-zero-to-advanced':     daxZeroToAdvanced     as CourseDetail,
  'nestjs-api-architecture':  nestjsApiArchitecture as CourseDetail,
  'nextjs-personal-brand-site': nextjsPersonalBrand as CourseDetail,
  'python-etl-for-power-bi':  pythonEtlForPowerBi   as CourseDetail,
  'the-crossover-series':     theCrossoverSeries    as CourseDetail,
  'think-and-build-rich':     thinkAndBuildRich     as CourseDetail,
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug') ?? ''
  const v    = searchParams.get('v')
  const m    = searchParams.get('m')

  const course = COURSES[slug]
  if (!course) return new Response('Not found', { status: 404 })

  const accent = course.pillarColor
  const label  = `FTTG Learn · ${course.pillarLabel}`

  let mainTitle    = course.title
  let subtitle     = course.subtitle
  let breadcrumb   = ''

  if (m) {
    const mod = course.modules.find(mod => mod.id === m)
    if (mod) {
      mainTitle  = mod.title
      subtitle   = mod.description
      breadcrumb = course.title
    }
  } else if (v) {
    const lesson = findLessonBySlug(course.modules, v)
    if (lesson) {
      mainTitle  = lesson.title
      subtitle   = lesson.description ?? course.subtitle
      breadcrumb = course.title
    }
  }

  const titleSize = mainTitle.length > 40 ? 52 : mainTitle.length > 25 ? 64 : 76

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
              {label}
            </span>
          </div>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {breadcrumb ? (
              <div
                style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: 22,
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
              >
                {breadcrumb}
              </div>
            ) : null}
            <div
              style={{
                color: '#ffffff',
                fontSize: titleSize,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                maxWidth: 960,
              }}
            >
              {mainTitle}
            </div>
            {subtitle ? (
              <div
                style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 26,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  maxWidth: 900,
                }}
              >
                {subtitle.length > 120 ? subtitle.slice(0, 117) + '…' : subtitle}
              </div>
            ) : null}
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
    { ...SIZE },
  )
}
