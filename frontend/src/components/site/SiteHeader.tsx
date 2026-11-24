import { useState, type FocusEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRightIcon, LogoMark, LogoText, PenIcon } from '../../assets/icons'
import { MENUS } from './menu'
import './SiteHeader.css'

/**
 * GNB (Figma 196:37468 / 2Depth 패널 25403:2614)
 * - 콘텐츠 최대 폭 1920px (배경·하단선은 화면 전체)
 * - 1Depth 는 마우스 오버·현재 섹션일 때 파란색
 * - 1Depth 메뉴에 마우스를 올리거나 포커스하면 전체 2Depth 메뉴가 펼쳐짐
 * - 펼친 패널은 본문 위에 겹쳐 표시 (헤더 자리 높이는 80px 고정)
 */
/** 현재 경로가 해당 1Depth 메뉴의 하위 메뉴에 속하는지 */
function isSectionActive(label: string, pathname: string) {
  const menu = MENUS.find((m) => m.label === label)
  return !!menu?.children?.some((sub) => pathname === sub.to || pathname.startsWith(`${sub.to}/`))
}

export default function SiteHeader() {
  const { pathname } = useLocation()
  // 메뉴를 연 시점의 경로. 페이지가 바뀌면 자동으로 닫힘
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const open = openedAt === pathname
  const setOpen = (value: boolean) => setOpenedAt(value ? pathname : null)

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
  }

  return (
    <header className="gnb-wrap">
      <div
        className={`gnb${open ? ' is-open' : ''}`}
        onMouseLeave={() => setOpen(false)}
        onBlur={handleBlur}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        <div className="gnb__inner">
        <Link to="/news" className="gnb__logo" aria-label="세명소프트 홈">
          <LogoMark className="gnb__logo-mark" aria-hidden="true" />
          <LogoText className="gnb__logo-text" aria-hidden="true" />
        </Link>

        <div className="gnb__right">
          <nav className="gnb__menu" aria-label="주 메뉴" onMouseEnter={() => setOpen(true)} onFocus={() => setOpen(true)}>
            <ul className="gnb__list">
              {MENUS.map((menu) => (
                  <li key={menu.label} className="gnb__item">
                    {menu.external ? (
                      <a className="gnb__depth1" href={menu.to} target="_blank" rel="noopener noreferrer">
                        {menu.label}
                        <ArrowUpRightIcon className="gnb__external" aria-label="새 창" />
                      </a>
                    ) : (
                      <NavLink
                        className={({ isActive }) =>
                          `gnb__depth1${isActive || isSectionActive(menu.label, pathname) ? ' is-active' : ''}`
                        }
                        to={menu.to}
                      >
                        {menu.label}
                      </NavLink>
                    )}
                    {menu.children && (
                      <ul className="gnb__depth2">
                        {menu.children.map((sub) => (
                          <li key={sub.to}>
                            <NavLink className="gnb__depth2-link" to={sub.to}>
                              {sub.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
              ))}
            </ul>
          </nav>

          <Link to="/inquiry" className="gnb__inquiry">
            <PenIcon aria-hidden="true" />
            도입문의
          </Link>
        </div>
        </div>
      </div>
    </header>
  )
}
