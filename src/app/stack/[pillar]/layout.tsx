import type { Metadata } from 'next'
import dataBi     from '../../../../data/pillars/data-bi.json'
import appDev     from '../../../../data/pillars/app-dev.json'
import philosophy from '../../../../data/pillars/philosophy.json'

const PILLARS: Record<string, typeof dataBi> = {
  'data-bi':    dataBi,
  'app-dev':    appDev,
  'philosophy': philosophy,
}

export async function generateMetadata(
  { params }: { params: { pillar: string } }
): Promise<Metadata> {
  const data = PILLARS[params.pillar]
  if (!data) return {}

  const { headline, description } = data
  const title    = `${headline} — FTTG Learn`
  const imageUrl = `/stack/${params.pillar}/opengraph-image`

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

export default function PillarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
