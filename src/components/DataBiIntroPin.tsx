import type { SimpleIcon } from 'simple-icons'
import {
  siPython, siR, siPostgresql, siSnowflake, siGooglebigquery,
  siDatabricks, siPandas, siJupyter, siPlotly, siClaude,
  siGooglecolab, siApacheairflow, siLooker, siMetabase,
  siApachesuperset, siMixpanel, siPosthog, siGoogleanalytics,
  siDeepnote, siObservable, siPrefect, siJulia, siPolars,
  siApachespark, siDuckdb, siAirbyte, siMatillion,
  siGooglesheets, siAirtable, siMysql, siSqlite, siQlik, siNumpy,
} from 'simple-icons'
import introData from '../../data/pillars/data-bi.json'

const SI_MAP: Record<string, SimpleIcon> = {
  python:         siPython,
  r:              siR,
  postgresql:     siPostgresql,
  snowflake:      siSnowflake,
  googlebigquery: siGooglebigquery,
  databricks:     siDatabricks,
  pandas:         siPandas,
  jupyter:        siJupyter,
  plotly:         siPlotly,
  claude:         siClaude,
  googlecolab:    siGooglecolab,
  apacheairflow:  siApacheairflow,
  looker:         siLooker,
  metabase:       siMetabase,
  apachesuperset: siApachesuperset,
  mixpanel:       siMixpanel,
  posthog:        siPosthog,
  googleanalytics:siGoogleanalytics,
  deepnote:       siDeepnote,
  observable:     siObservable,
  prefect:        siPrefect,
  julia:          siJulia,
  polars:         siPolars,
  apachespark:    siApachespark,
  duckdb:         siDuckdb,
  airbyte:        siAirbyte,
  matillion:      siMatillion,
  googlesheets:   siGooglesheets,
  airtable:       siAirtable,
  mysql:          siMysql,
  sqlite:         siSqlite,
  qlik:           siQlik,
  numpy:          siNumpy,
}

// Custom SVG paths for brand icons absent from simple-icons
const CUSTOM_MAP: Record<string, string> = {
  powerbi: 'M1 14h6v8H1zM9 8h6v14H9zM17 2h6v20h-6z',
}

function ToolChip({ slug, name, color }: { slug: string; name: string; color: string }) {
  const si   = slug ? SI_MAP[slug]    : undefined
  const path = si?.path ?? (slug ? CUSTOM_MAP[slug] : undefined)

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-bg-elevated border border-white/5 rounded-sm">
      {path && (
        <svg
          role="img"
          viewBox="0 0 24 24"
          width={11}
          height={11}
          fill={`#${color}`}
          aria-label={name}
          className="shrink-0"
        >
          <path d={path} />
        </svg>
      )}
      <span className="font-sans text-[11px] text-text-secondary leading-none">{name}</span>
    </span>
  )
}

export default function DataBiIntroPin({ courseCount }: { courseCount: number }) {
  return (
    <div className="col-span-full card-dark border border-accent-bi/20 p-6 flex flex-col lg:flex-row gap-6 lg:gap-10">

      {/* Left: heading block */}
      <div className="flex flex-col gap-3 lg:w-60 shrink-0">
        <span className="font-sans text-[10px] font-semibold tracking-widest uppercase text-accent-bi">
          {introData.pillarLabel}
        </span>
        <h2 className="font-display text-2xl font-bold text-text-primary leading-tight">
          {introData.headline}
        </h2>
        <p className="font-sans text-sm font-semibold text-gold">
          {introData.tagline}
        </p>
        <p className="font-sans text-sm text-text-secondary leading-relaxed">
          {introData.description}
        </p>
        <p className="font-sans text-xs text-text-muted mt-auto pt-3 border-t border-white/5">
          {courseCount} course{courseCount !== 1 ? 's' : ''} in this pillar
        </p>
      </div>

      {/* Vertical divider */}
      <div className="hidden lg:block w-px bg-white/5 self-stretch shrink-0" />

      {/* Right: full tech stack — 2 columns on xl */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-x-8 gap-y-2.5 content-start">
        {introData.stack.map(row => (
          <div key={row.category} className="flex items-start gap-2">
            <span className="font-sans text-[10px] font-bold tracking-widest text-text-secondary uppercase w-32 shrink-0 pt-1.5 leading-tight">
              {row.category}
            </span>
            <div className="flex flex-wrap gap-1">
              {row.tools.map(tool => (
                <ToolChip key={tool.name} slug={tool.slug} name={tool.name} color={tool.color} />
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
