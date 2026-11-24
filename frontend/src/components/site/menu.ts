// GNB 메뉴 정의 (Figma: GNB 196:37468 / 2Depth 패널 25403:2614). 헤더와 메뉴별 페이지의 탭이 함께 사용
export type SubMenu = { label: string; to: string }
export type MainMenu = {
  label: string
  /** 1Depth 클릭 시 이동 경로 (하위 메뉴가 있으면 첫 번째 하위 메뉴) */
  to: string
  external?: boolean
  children?: SubMenu[]
}

export const BLOG_URL = 'https://m.blog.naver.com/smsoft_blog?tab=1'

export const MENUS: MainMenu[] = [
  {
    label: 'AX',
    to: '/ax/intro',
    children: [
      { label: 'AX소개', to: '/ax/intro' },
      { label: '대표성과', to: '/ax/achievements' },
      { label: '주요실적', to: '/ax/performance' },
    ],
  },
  {
    label: 'R&D',
    to: '/rnd/intro',
    children: [
      { label: 'R&D소개', to: '/rnd/intro' },
      { label: '핵심 연구 기술', to: '/rnd/technology' },
      { label: '주요 연구 영역', to: '/rnd/areas' },
      { label: '주요실적', to: '/rnd/performance' },
    ],
  },
  {
    label: 'Solution',
    to: '/solution/rag',
    children: [
      { label: 'Ternis RAG', to: '/solution/rag' },
      { label: 'Ternis MLOps', to: '/solution/mlops' },
      { label: 'Ternis Agent', to: '/solution/agent' },
    ],
  },
  {
    label: 'About Us',
    to: '/about/company',
    children: [
      { label: '회사소개', to: '/about/company' },
      { label: 'CI', to: '/about/ci' },
    ],
  },
  { label: 'News', to: '/news' },
  { label: 'Blog', to: BLOG_URL, external: true },
]
