import type { Metadata } from 'next'
import { SHEETS } from '../../../../data/cheatsheets/registry'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const sheet = SHEETS.find(s => s.key === params.slug)
  if (!sheet) return {}

  const { headline, description } = sheet.data
  const title = `${headline} — FTTG Learn`
  const imageUrl = `/cheatsheets/${params.slug}/opengraph-image`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: headline }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
