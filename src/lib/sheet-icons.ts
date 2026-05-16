import {
  siPython,
  siGit,
  siVim,
  siHomebrew,
  siHtml5,
  siCss,
  siJavascript,
  siMarkdown,
  siPostgresql,
  siJson,
} from 'simple-icons'

// SVG path data (24×24 viewBox) for each sheet key.
// null = no brand icon available — UI falls back to a lucide icon.
export const SHEET_ICON_PATHS: Record<string, string | null> = {
  sql:          siPostgresql.path,
  python:       siPython.path,
  dax:          null,              // lucide: BarChart3
  git:          siGit.path,
  vscode:       null,              // lucide: Code2
  vim:          siVim.path,
  homebrew:     siHomebrew.path,
  html:         siHtml5.path,
  css3:         siCss.path,
  json:         siJson.path,
  java:         null,              // lucide: Coffee
  javascript:   siJavascript.path,
  'ai-prompts': null,              // lucide: Bot
  markdown:     siMarkdown.path,
}
