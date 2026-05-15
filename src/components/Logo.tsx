import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showLearn?: boolean
  href?: string
}

const SIZES = {
  sm: { logoH: 28, logoW: 128, iconSize: 28 },
  md: { logoH: 36, logoW: 165, iconSize: 36 },
  lg: { logoH: 44, logoW: 201, iconSize: 44 },
}

export default function Logo({ size = 'md', showLearn = true, href = '/' }: LogoProps) {
  const { logoH, logoW, iconSize } = SIZES[size]

  return (
    <Link href={href} className="inline-flex items-center group select-none">
      {showLearn ? (
        <Image
          src="/logo.svg"
          alt="FTTG Learn"
          width={logoW}
          height={logoH}
          priority
          className="transition-opacity duration-200 group-hover:opacity-80"
        />
      ) : (
        <Image
          src="/icon.svg"
          alt="FTTG"
          width={iconSize}
          height={iconSize}
          priority
          className="rounded-sm transition-opacity duration-200 group-hover:opacity-80"
        />
      )}
    </Link>
  )
}
