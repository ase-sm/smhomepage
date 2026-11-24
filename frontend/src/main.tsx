import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import SiteLayout from './components/site/SiteLayout'
import NewsListPage from './pages/site/NewsListPage'
import NewsDetailPage from './pages/site/NewsDetailPage'
import InquiryPage from './pages/site/InquiryPage'

// 관리자 화면·메뉴 페이지는 별도 청크로 분리 (에디터 번들이 홈페이지에 포함되지 않도록)
const lazyPage = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({
  Component: (await load()).default,
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      // http://localhost:3000/ 접속 시 화면 목록 (메인 화면 구현 전까지)
      { index: true, element: <Navigate to="/screens" replace /> },
      // GNB 메뉴 페이지 (components/site/menu.ts 와 경로 일치)
      { path: 'ax', element: <Navigate to="/ax/intro" replace /> },
      { path: 'ax/intro', lazy: lazyPage(() => import('./pages/site/ax/AxIntroPage')) },
      { path: 'ax/achievements', lazy: lazyPage(() => import('./pages/site/ax/AxAchievementsPage')) },
      { path: 'ax/performance', lazy: lazyPage(() => import('./pages/site/ax/AxPerformancePage')) },
      { path: 'rnd', element: <Navigate to="/rnd/intro" replace /> },
      { path: 'rnd/intro', lazy: lazyPage(() => import('./pages/site/rnd/RndIntroPage')) },
      { path: 'rnd/technology', lazy: lazyPage(() => import('./pages/site/rnd/RndTechnologyPage')) },
      { path: 'rnd/areas', lazy: lazyPage(() => import('./pages/site/rnd/RndAreasPage')) },
      { path: 'rnd/performance', lazy: lazyPage(() => import('./pages/site/rnd/RndPerformancePage')) },
      { path: 'solution', element: <Navigate to="/solution/rag" replace /> },
      { path: 'solution/rag', lazy: lazyPage(() => import('./pages/site/solution/SolutionRagPage')) },
      { path: 'solution/mlops', lazy: lazyPage(() => import('./pages/site/solution/SolutionMlopsPage')) },
      { path: 'solution/agent', lazy: lazyPage(() => import('./pages/site/solution/SolutionAgentPage')) },
      { path: 'about', element: <Navigate to="/about/company" replace /> },
      { path: 'about/company', lazy: lazyPage(() => import('./pages/site/about/AboutCompanyPage')) },
      { path: 'about/ci', lazy: lazyPage(() => import('./pages/site/about/AboutCiPage')) },
      { path: 'news', element: <NewsListPage /> },
      { path: 'news/:id', element: <NewsDetailPage /> },
      { path: 'inquiry', element: <InquiryPage /> },
    ],
  },
  // 화면 목록 (기획서 N-메뉴구조도-01 기준, 개발·검수용)
  { path: '/screens', lazy: lazyPage(() => import('./pages/screens/ScreenListPage')) },
  { path: '/admin/login', lazy: lazyPage(() => import('./pages/admin/AdminLoginPage')) },
  {
    path: '/admin',
    lazy: lazyPage(() => import('./pages/admin/AdminLayout')),
    children: [
      { index: true, element: <Navigate to="/admin/news" replace /> },
      { path: 'news', lazy: lazyPage(() => import('./pages/admin/AdminNewsListPage')) },
      { path: 'news/new', lazy: lazyPage(() => import('./pages/admin/AdminNewsFormPage')) },
      { path: 'news/:id', lazy: lazyPage(() => import('./pages/admin/AdminNewsDetailPage')) },
      { path: 'news/:id/edit', lazy: lazyPage(() => import('./pages/admin/AdminNewsFormPage')) },
    ],
  },
  { path: '*', element: <Navigate to="/news" replace /> },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
