import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, api } from '../../api/client'
import type { AdminMe } from '../../api/types'
import './admin.css'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      setError('아이디와 비밀번호를 입력해 주세요.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.post<AdminMe>('/api/admin/auth/login', { username: username.trim(), password })
      const redirect = params.get('redirect')
      navigate(redirect && redirect.startsWith('/admin') ? redirect : '/admin/news', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError && err.status !== 0 ? err.message : '로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__box" onSubmit={submit} noValidate>
        <h1 className="admin-login__title">세명소프트 ADMIN</h1>
        <label className="admin-login__field">
          <span>아이디</span>
          <input
            className="admin-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>
        <label className="admin-login__field">
          <span>비밀번호</span>
          <input
            className="admin-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <button type="submit" className="admin-btn admin-btn--dark admin-login__submit" disabled={loading}>
          로그인
        </button>
      </form>
    </div>
  )
}
