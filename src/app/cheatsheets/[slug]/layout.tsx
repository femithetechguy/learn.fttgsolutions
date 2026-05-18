import type { Metadata } from 'next'
import { SHEETS } from '../../../../data/cheatsheets/registry'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const sheet = SHEETS.find(s => s.key === params.slug)
  if (!sheet) return {}

  const { headline, description, label } = sheet.data
  const title    = `${headline} — FTTG Learn`
  const imageUrl = `/cheatsheets/${params.slug}/opengraph-image`
  const keywords = [label, headline, 'cheat sheet', 'reference', 'commands', 'FTTG Learn']

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type:   'website',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: headline }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [imageUrl],
    },
  }
}

export default function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const sheet = SHEETS.find(s => s.key === params.slug)
  const jsonLd = sheet ? {
    '@context':   'https://schema.org',
    '@type':      'TechArticle',
    name:         sheet.data.headline,
    description:  sheet.data.description,
    url:          `https://learn.fttgsolutions.com/cheatsheets/${params.slug}`,
    publisher: {
      '@type': 'Organization',
      name:    'FTTG Solutions',
      url:     'https://learn.fttgsolutions.com',
    },
    inLanguage: 'en',
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
