export interface PageResponse<T> {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface NewsCard {
  id: number
  title: string
  summary: string | null
  thumbnailUrl: string | null
  publishDate: string
}

export interface NewsLink {
  id: number
  title: string
}

export interface NewsDetail {
  id: number
  title: string
  summary: string | null
  content: string
  sourceName: string | null
  sourceUrl: string | null
  publishDate: string
  prev: NewsLink | null
  next: NewsLink | null
}

export type NewsStatus = 'PUBLIC' | 'SCHEDULED' | 'PRIVATE'

export const NEWS_STATUS_LABEL: Record<NewsStatus, string> = {
  PUBLIC: '공개',
  SCHEDULED: '예약',
  PRIVATE: '비공개',
}

export interface AdminNewsRow {
  id: number
  title: string
  status: NewsStatus
  publishDate: string
  updatedAt: string
}

export interface AdminNewsDetail {
  id: number
  title: string
  summary: string | null
  content: string
  sourceName: string | null
  sourceUrl: string | null
  published: boolean
  publishDate: string
  status: NewsStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface NewsRequest {
  title: string
  summary: string
  content: string
  sourceName: string
  sourceUrl: string
  published: boolean
  publishDate: string
}

export interface AdminMe {
  username: string
  displayName: string
}

export type InquiryCategory = 'AX' | 'R&D' | 'Solution' | '기타'

export interface InquiryRequest {
  category: InquiryCategory
  company: string
  name: string
  email: string
  phone: string
  content: string
  agreed: boolean
}
