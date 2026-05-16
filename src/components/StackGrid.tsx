import { SI_MAP, CUSTOM_MAP } from '@/lib/brand-icons'

interface StackTool     { name: string; slug: string; color: string }
interface StackCategory { category: string; tools: StackTool[] }

function ToolChip({ slug, name, color }: StackTool) {
  const path = (slug ? SI_MAP[slug]?.path : undefined) ?? (slug ? CUSTOM_MAP[slug] : undefined)

  return (
    <span className="group inline-flex items-center gap-1.5 px-2.5 py-1 bg-bg-elevated border border-white/5 rounded-sm cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/5">
      {path && (
        <svg
          role="img"
          viewBox="0 0 24 24"
          width={12}
          height={12}
          fill={`#${color}`}
          aria-label={name}
          className="shrink-0 transition-transform duration-200 group-hover:scale-125"
        >
          <path d={path} />
        </svg>
      )}
      <span className="font-sans text-[11px] text-text-secondary leading-none transition-colors duration-200 group-hover:text-text-primary">{name}</span>
    </span>
  )
}

interface StackGridProps {
  categories: StackCategory[]
  columns?: 1 | 2 | 3
}

export default function StackGrid({ categories, columns = 2 }: StackGridProps) {
  const colClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 xl:grid-cols-2',
    3: 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
  }[columns]

  return (
    <div className={`grid ${colClass} gap-x-10 gap-y-3`}>
      {categories.map(row => (
        <div key={row.category} className="flex items-start gap-2 sm:gap-3">
          <span className="font-sans text-[10px] font-bold tracking-widest text-text-secondary uppercase w-24 sm:w-32 shrink-0 pt-1.5 leading-tight">
            {row.category}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {row.tools.map(tool => (
              <ToolChip key={tool.name} {...tool} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
