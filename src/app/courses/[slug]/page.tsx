import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Special_Elite } from 'next/font/google'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ScrollHomeButton from '@/components/ScrollHomeButton'
import CourseBlackboard, { CourseDetail } from '@/components/CourseBlackboard'

const chalkFont = Special_Elite({ weight: '400', subsets: ['latin'], variable: '--font-chalk' })

export default function CourseBoardPage({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'data', 'courses', 'detail', `${params.slug}.json`)

  if (!fs.existsSync(filePath)) notFound()

  const course: CourseDetail = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  return (
    <div className={`min-h-screen bg-bg-primary bg-grid ${chalkFont.variable}`}>
      <Nav />

      <div className="overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">

          {/* Back link */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 font-sans text-sm text-text-muted hover:text-text-secondary transition-colors mb-8"
          >
            <ArrowLeft size={13} />
            All Courses
          </Link>

          {/* Blackboard */}
          <CourseBlackboard course={course} />

        </div>
      </div>

      <ScrollHomeButton />
      <Footer />
    </div>
  )
}
