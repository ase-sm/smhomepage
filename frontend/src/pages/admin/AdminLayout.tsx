import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ApiError, api } from '../../api/client'
import type { AdminMe } from '../../api/types'
import './admin.css'

/** 관리자 계정 로그인 후에만 진입 */
export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [me, setMe] = useState<AdminMe | null>(null)

  useEffect(() => {
    api
      .get<AdminMe>('/api/admin/auth/me')
      .then(setMe)
      .catch(() => {
        const redirect = encodeURIComponent(location.pathname + location.search)
        navigate(`/admin/login?redirect=${redirect}`, { replace: true })
      })
    // 최초 진입 시 1회 확인
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logout = async () => {
    try {
      await api.post('/api/admin/auth/logout')
    } catch (e) {
      if (!(e instanceof ApiError)) throw e
    }
    navigate('/admin/login', { replace: true })
  }

  if (!me) return <div className="admin-loading" aria-busy="true" />

  return (
    <div className="admin">
      <header className="admin-topbar">
        <p className="admin-topbar__title">세명소프트 ADMIN</p>
        <div className="admin-topbar__account">
          <span className="admin-topbar__user">
            {me.displayName} ({me.username})
          </span>
          <button type="button" className="admin-topbar__logout" onClick={logout}>
            로그아웃
          </button>
        </div>
      </header>
      <div className="admin-body">
        <nav className="admin-side" aria-label="관리자 메뉴">
          <NavLink to="/admin/news" className="admin-side__item">
            뉴스 관리
          </NavLink>
        </nav>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
