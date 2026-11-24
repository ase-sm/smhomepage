import { useEffect, type ReactNode } from 'react'
import { NavLink, useOutletContext } from 'react-router-dom'
import { MENUS } from './menu'
import type { SiteOutletContext } from './SiteLayout'
import './MenuPage.css'

type Props = {
  /** 1Depth 메뉴명 (MENUS 의 label) */
  section: string
  title: string
  description?: string
  /** 본문. 없으면 '{title} 콘텐츠를 준비중입니다' 안내만 화면 가운데 표시 */
  children?: ReactNode
  /** 같은 섹션 하위 메뉴 탭 숨김 */
  hideTabs?: boolean
  /** 제목 위 섹션명(1Depth 메뉴명) 숨김 */
  hideSection?: boolean
}

/** GNB 하위 메뉴 페이지 공통 틀: 섹션명 + 제목 + 같은 섹션 탭 + 본문 */
export default function MenuPage({ section, title, description, children, hideTabs = false, hideSection = false }: Props) {
  const siblings = MENUS.find((m) => m.label === section)?.children ?? []
  const isEmpty = children == null
  const { setBannerHidden } = useOutletContext<SiteOutletContext>()

  // 콘텐츠 준비 중: 안내 문구 외 다른 요소(제목·탭·문의 배너)는 표시하지 않음
  useEffect(() => {
    setBannerHidden(isEmpty)
    return () => setBannerHidden(false)
  }, [isEmpty, setBannerHidden])

  if (isEmpty) {
    return (
      <div className="menu-page menu-page--empty">
        <h1 className="menu-page__empty">{title} 콘텐츠를 준비중입니다</h1>
      </div>
    )
  }

  return (
    <div className="menu-page">
      <div className="menu-page__head">
        {!hideSection && <p className="menu-page__section">{section}</p>}
        <h1 className="menu-page__title">{title}</h1>
        {description && <p className="menu-page__desc">{description}</p>}
      </div>

      {!hideTabs && siblings.length > 1 && (
        <nav className="menu-page__tabs" aria-label={`${section} 하위 메뉴`}>
          {siblings.map((sub) => (
            <NavLink key={sub.to} to={sub.to} className="menu-page__tab">
              {sub.label}
            </NavLink>
          ))}
        </nav>
      )}

      <div className="menu-page__body">
        {children}
      </div>
    </div>
  )
}
