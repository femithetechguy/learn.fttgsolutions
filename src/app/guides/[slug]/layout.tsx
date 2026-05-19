import type { Metadata } from 'next'
import { GUIDES } from '@/lib/guides'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const guide = GUIDES.find(g => g.slug === params.slug)
  if (!guide) return {}

  const { title, subtitle } = guide
  const pageTitle = `${title} — FTTG Learn`
  const imageUrl  = `/guides/${params.slug}/opengraph-image`

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

export default function GuideSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
