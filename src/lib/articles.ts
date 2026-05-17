import data from '../../data/articles.json'

export interface Article {
  slug:     string
  title:    string
  subtitle: string
  pillar:   'data-bi' | 'app-dev' | 'philosophy'
  date:     string
  readTime: number
  src:      string
  author?:  string
}

export interface ArticlesData {
  comingSoon:         boolean
  comingSoonHeading?: string
  comingSoonMessage?: string
  comingSoonSubtext?: string
  articles:           Article[]
}

const articlesData = data as unknown as ArticlesData

export const ARTICLES: Article[] = articlesData.articles
export default articlesData
