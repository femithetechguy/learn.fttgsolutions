import { Code2, BarChart3, Coffee, Bot, Database } from 'lucide-react'
import { SHEET_ICON_PATHS } from '@/lib/sheet-icons'

const LUCIDE_FALLBACKS: Record<string, React.ElementType> = {
  dax:          BarChart3,
  'm-code':     Database,
  vscode:       Code2,
  java:         Coffee,
  'ai-prompts': Bot,
}

interface SheetIconProps {
  sheetKey: string
  color: string   // hex string with #
  size?: number
  className?: string
}

export default function SheetIcon({ sheetKey, color, size = 16, className }: SheetIconProps) {
  const path = SHEET_ICON_PATHS[sheetKey]

  if (path) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        style={{ flexShrink: 0 }}
        className={className}
        aria-hidden
      >
        <path d={path} />
      </svg>
    )
  }

  const LucideIcon = LUCIDE_FALLBACKS[sheetKey] ?? Code2
  return <LucideIcon size={size} style={{ color, flexShrink: 0 }} className={className} aria-hidden />
}
