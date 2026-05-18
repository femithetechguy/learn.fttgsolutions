import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Cheat Sheets — FTTG Learn',
  description: 'Free developer cheat sheets for SQL, Python, DAX, Power BI, Git, JavaScript, and more.',
  keywords:    ['cheat sheet', 'developer reference', 'SQL cheat sheet', 'Python cheat sheet', 'DAX cheat sheet', 'Power BI', 'Git commands', 'FTTG Learn'],
  openGraph: {
    title:       'Cheat Sheets — FTTG Learn',
    description: 'Free developer cheat sheets for SQL, Python, DAX, Power BI, Git, JavaScript, and more.',
    type:        'website',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Cheat Sheets — FTTG Learn',
    description: 'Free developer cheat sheets for SQL, Python, DAX, Power BI, Git, JavaScript, and more.',
  },
}

export default function CheatsheetsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
