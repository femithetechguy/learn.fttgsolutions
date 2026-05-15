import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FTTG Learn — Build. Think. Grow.',
  description: 'Technical training and philosophy for builders. Power BI, Python, full-stack development, and the principles that drive real growth.',
  keywords: ['Power BI', 'DAX', 'Python', 'Next.js', 'FTTG Solutions', 'data engineering', 'full-stack'],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'FTTG Learn',
    description: 'Build. Think. Grow.',
    siteName: 'FTTG Solutions',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
