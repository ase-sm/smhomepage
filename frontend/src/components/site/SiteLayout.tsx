import { useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import SiteFooter from './SiteFooter'
import SiteHeader from './SiteHeader'
import './SiteLayout.css'

/** 하위 페이지에서 레이아웃을 제어할 때 사용 (useOutletContext<SiteOutletContext>()) */
export type SiteOutletContext = {
  /** 푸터 문의 배너 숨김 (콘텐츠 준비 중 화면 등) */
  setBannerHidden: (hidden: boolean) => void
}

export default function SiteLayout() {
  const { pathname } = useLocation()
  // 푸터 문의 배너 미노출 화면: 문의하기, 뉴스(목록·상세, Figma 140:14807 / 433:12746), About Us(회사소개·CI)
  // + 페이지가 직접 숨긴 경우 (콘텐츠 준비 중 화면)
  const [bannerHidden, setBannerHidden] = useState(false)
  const showBanner =
    !bannerHidden &&
    !pathname.startsWith('/inquiry') &&
    !pathname.startsWith('/news') &&
    !pathname.startsWith('/about')
  const outletContext: SiteOutletContext = { setBannerHidden }

  return (
    <div className="site">
      <SiteHeader />

      <main className="site-main">
        <Outlet context={outletContext} />
      </main>

      <SiteFooter showBanner={showBanner} />

      <ScrollRestoration />
    </div>
  )
}
