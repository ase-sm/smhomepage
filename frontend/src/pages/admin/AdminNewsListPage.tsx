import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api, qs } from '../../api/client'
import type { AdminNewsRow, NewsStatus, PageResponse } from '../../api/types'
import Pagination from '../../components/Pagination'
import { formatDate } from '../../utils/format'
import StatusBadge from './StatusBadge'

const STATUS_OPTIONS: { value: '' | NewsStatus; label: string }[] = [
  { value: '', label: '전체' },
  { value: 'PUBLIC', label: '공개' },
  { value: 'SCHEDULED', label: '예약' },
  { value: 'PRIVATE', label: '비공개' },
]
const SIZE_OPTIONS = [10, 30, 50]

export default function AdminNewsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()

  // URL 이 조회 조건의 기준 (상세 → 목록 복귀 시 검색 조건·페이지 유지)
  const status = (params.get('status') ?? '') as '' | NewsStatus
  const keyword = params.get('keyword') ?? ''
  const page = Math.max(1, Number(params.get('page')) || 1)
  const sizeParam = Number(params.get('size'))
  const size = SIZE_OPTIONS.includes(sizeParam) ? sizeParam : 10

  const [statusInput, setStatusInput] = useState(status)
  const [keywordInput, setKeywordInput] = useState(keyword)
  const [data, setData] = useState<PageResponse<AdminNewsRow> | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    setStatusInput(status)
    setKeywordInput(keyword)
  }, [status, keyword])

  useEffect(() => {
    let cancelled = false
    setError(false)
    api
      .get<PageResponse<AdminNewsRow>>(`/api/admin/news${qs({ status, keyword, page, size })}`)
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [status, keyword, page, size])

  const update = (next: Record<string, string | number | undefined>) => {
    const merged = { status, keyword, page, size, ...next }
    const sp = new URLSearchParams()
    if (merged.status) sp.set('status', String(merged.status))
    if (merged.keyword) sp.set('keyword', String(merged.keyword))
    if (Number(merged.page) > 1) sp.set('page', String(merged.page))
    if (Number(merged.size) !== 10) sp.set('size', String(merged.size))
    setParams(sp)
  }

  // [검색] 클릭 또는 Enter → 조회 후 1페이지
  const search = (e: React.FormEvent) => {
    e.preventDefault()
    update({ status: statusInput, keyword: keywordInput.trim(), page: 1 })
  }

  // [초기화] → 조건을 default 로 되돌리고 전체 목록 재조회 (노출 건수는 유지)
  const reset = () => {
    setStatusInput('')
    setKeywordInput('')
    update({ status: '', keyword: '', page: 1 })
  }

  const listState = { listSearch: location.search }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <h1 className="admin-page__title">뉴스 관리</h1>
        <Link to="/admin/news/new" className="admin-btn admin-btn--dark admin-btn--register">
          + 등록
        </Link>
      </div>

      <form className="admin-search" onSubmit={search}>
        <label className="admin-search__label" htmlFor="search-status">
          상태
        </label>
        <div className="admin-select admin-select--status">
          <select
            id="search-status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as '' | NewsStatus)}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <span className="admin-select__arrow" aria-hidden="true">
            ▾
          </span>
        </div>
        <label className="admin-search__label" htmlFor="search-keyword">
          검색어
        </label>
        <input
          id="search-keyword"
          className="admin-input admin-search__keyword"
          placeholder="제목을 입력해 주세요."
          value={keywordInput}
          onChange={(e) => setKeywordInput(e.target.value)}
        />
        <button type="submit" className="admin-btn admin-btn--dark admin-btn--search">
          검색
        </button>
        <button type="button" className="admin-btn admin-btn--outline admin-btn--search" onClick={reset}>
          초기화
        </button>
      </form>

      <div className="admin-list-tools">
        <div className="admin-select admin-select--size">
          <select
            aria-label="노출 건수"
            value={size}
            onChange={(e) => update({ size: Number(e.target.value), page: 1 })}
          >
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}개
              </option>
            ))}
          </select>
          <span className="admin-select__arrow" aria-hidden="true">
            ▾
          </span>
        </div>
      </div>

      <table className="admin-table">
        <colgroup>
          <col style={{ width: 80 }} />
          <col />
          <col style={{ width: 110 }} />
          <col style={{ width: 150 }} />
          <col style={{ width: 150 }} />
          <col style={{ width: 110 }} />
        </colgroup>
        <thead>
          <tr>
            <th>No</th>
            <th className="is-left">제목</th>
            <th>상태</th>
            <th>게시일</th>
            <th>수정일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {error && (
            <tr>
              <td colSpan={6} className="admin-table__empty">
                목록을 불러오지 못했습니다.
              </td>
            </tr>
          )}
          {!error && data?.items.length === 0 && (
            <tr>
              <td colSpan={6} className="admin-table__empty">
                검색 결과가 없습니다.
              </td>
            </tr>
          )}
          {!error &&
            data?.items.map((n, i) => (
              <tr key={n.id}>
                {/* 목록 순서 기준 역순 번호 (전체 건수 → 1) */}
                <td className="is-num">{data.totalElements - (data.page - 1) * data.size - i}</td>
                <td className="is-left">
                  <Link to={`/admin/news/${n.id}`} state={listState} className="admin-table__title ellipsis">
                    {n.title}
                  </Link>
                </td>
                <td>
                  <StatusBadge status={n.status} />
                </td>
                <td className="is-num">{formatDate(n.publishDate)}</td>
                <td className="is-num">{formatDate(n.updatedAt)}</td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn--outline admin-btn--small"
                    onClick={() => navigate(`/admin/news/${n.id}/edit`, { state: listState })}
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {data && data.totalPages > 0 && (
        <Pagination variant="admin" page={page} totalPages={data.totalPages} onChange={(p) => update({ page: p })} />
      )}
    </div>
  )
}
