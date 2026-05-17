import type { CourseModule, Lesson } from '@/types/course'

export function lessonToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[''·]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function findLessonBySlug(modules: CourseModule[], slug: string): Lesson | null {
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      if (lessonToSlug(lesson.title) === slug) return lesson
    }
  }
  return null
}
