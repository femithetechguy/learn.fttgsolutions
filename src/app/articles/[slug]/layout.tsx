import type { Metadata } from 'next'
import { ARTICLES } from '@/lib/articles'

const PILLAR_COLORS: Record<string, string> = {
  'data-bi':    '#1D9E75',
  'app-dev':    '#378ADD',
  'philosophy': '#EF9F27',
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const article = ARTICLES.find(a => a.slug === params.slug)
  if (!article) return {}

  const { title, subtitle } = article
  const pageTitle = `${title} — FTTG Learn`
  const imageUrl  = `/articles/${params.slug}/opengraph-image`

  return {
    title: pageTitle,
    description: subtitle,
    openGraph: {
      title: pageTitle,
      description: subtitle,
      type: 'article',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: subtitle,
      images: [imageUrl],
    },
  }
}

export { PILLAR_COLORS }

export default function ArticleSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
