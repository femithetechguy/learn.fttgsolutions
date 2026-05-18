import type { Metadata } from 'next'

const title       = 'Favourites — FTTG Learn'
const description = 'Your saved courses, lessons, and resources in one place.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
  twitter:   { card: 'summary_large_image', title, description },
}

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
