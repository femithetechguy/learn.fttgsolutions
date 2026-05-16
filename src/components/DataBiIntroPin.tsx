import StackGrid from '@/components/StackGrid'
import introData from '../../data/pillars/data-bi.json'

export default function DataBiIntroPin({ courseCount }: { courseCount: number }) {
  return (
    <div className="col-span-full card-dark border border-accent-bi/20 p-6 flex flex-col lg:flex-row gap-6 lg:gap-10">

      {/* Left: heading block */}
      <div className="flex flex-col gap-3 lg:w-60 shrink-0">
        <span className="font-sans text-xs font-semibold tracking-widest uppercase text-accent-bi">
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

      <div className="hidden lg:block w-px bg-white/5 self-stretch shrink-0" />

      <div className="flex-1">
        <StackGrid categories={introData.stack} columns={2} />
      </div>

    </div>
  )
}
