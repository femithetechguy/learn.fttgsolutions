import { type MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'
import { SHEETS } from '../../data/cheatsheets/registry'
import { GUIDES } from '@/lib/guides'

const BASE = 'https://learn.fttgsolutions.com'

const COURSE_SLUGS = [
  'builders-philosophy',
  'dax-zero-to-advanced',
  'nestjs-api-architecture',
  'nextjs-personal-brand-site',
  'python-etl-for-power-bi',
  'the-crossover-series',
  'think-and-build-rich',
]

const STACK_PILLARS = ['data-bi', 'app-dev', 'philosophy']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                   lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/courses`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/cheatsheets`,  lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/guides`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/resources`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/stack`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/favorites`,    lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  const cheatsheetPages: MetadataRoute.Sitemap = SHEETS.map(s => ({
    url:             `${BASE}/cheatsheets/${s.key}`,
    lastModified:    now,
    changeFrequency: 'monthly',
    priority:        0.85,
  }))

  const stackPages: MetadataRoute.Sitemap = STACK_PILLARS.map(p => ({
    url:             `${BASE}/stack/${p}`,
    lastModified:    now,
    changeFrequency: 'monthly',
    priority:        0.75,
  }))

  const coursePages: MetadataRoute.Sitemap = COURSE_SLUGS.map(slug => ({
    url:             `${BASE}/courses/${slug}`,
    lastModified:    now,
    changeFrequency: 'weekly',
    priority:        0.85,
  }))

  const guidePages: MetadataRoute.Sitemap = GUIDES.map(g => ({
    url:             `${BASE}/guides/${g.slug}`,
    lastModified:    new Date(g.date),
    changeFrequency: 'monthly' as const,
    priority:        0.8,
  }))

  return [
    ...staticPages,
    ...cheatsheetPages,
    ...stackPages,
    ...coursePages,
    ...guidePages,
  ]
}
