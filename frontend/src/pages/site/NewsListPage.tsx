import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { api, qs } from '../../api/client'
import type { NewsCard, PageResponse } from '../../api/types'
import Pagination from '../../components/Pagination'
import { formatDate } from '../../utils/format'
import './news.css'

const PAGE_SIZE = 5

/**
 * 뉴스 목록 (Figma News 140:14807)
 * - 왼쪽 텍스트 목록, 오른쪽에 마우스를 올린(포커스한) 뉴스의 대표 이미지·요약 미리보기
 * - 미리보기 기본값은 첫 번째 뉴스
 */
export default function NewsListPage() {
  const [params, setParams] = useSearchParams()
  const location = useLocation()
  const page = Math.max(1, Number(params.get('page')) || 1)

  const [data, setData] = useState<PageResponse<NewsCard> | null>(null)
  const [error, setError] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    setError(false)
    api
      .get<PageResponse<NewsCard>>(`/api/news${qs({ page, size: PAGE_SIZE })}`)
      .then((res) => {
        if (cancelled) return
        setData(res)
        setActiveId(res.items[0]?.id ?? null)
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [page])

  const goPage = (p: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
    window.scrollTo({ top: 0 })
  }

  // 상세 → [목록으로] 시 직전 페이지 유지
  const linkState = { listSearch: location.search }
  const items = data?.items ?? []
  const active = items.find((n) => n.id === activeId) ?? items[0]

  return (
    <div className="news-list">
      <div className="page-title">
        <p className="page-title__label">News</p>
        <h1 className="page-title__heading">
          새로운 뉴스과 활동을
          <br />
          전해드립니다.
        </h1>
      </div>

      <section className="news-board">
        {error && <p className="news-empty">뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>}

        {!error && data && (
          <>
            <p className="news-board__count">전체 {data.totalElements}건</p>

            {items.length === 0 ? (
              <p className="news-empty">등록된 뉴스가 없습니다.</p>
            ) : (
              <div className="news-board__body">
                <ul className="news-board__list">
                  {items.map((n) => (
                    <li key={n.id}>
                      <Link
                        to={`/news/${n.id}`}
                        state={linkState}
                        className={`news-row${n.id === active?.id ? ' is-active' : ''}`}
                        onMouseEnter={() => setActiveId(n.id)}
                        onFocus={() => setActiveId(n.id)}
                      >
                        <div className="news-row__text">
                          <p className="news-row__title ellipsis">{n.title}</p>
                          {n.summary && <p className="news-row__summary ellipsis">{n.summary}</p>}
                        </div>
                        <p className="news-row__date">{formatDate(n.publishDate)}</p>
                      </Link>
                    </li>
                  ))}
                </ul>

                {active && (
                  <Link to={`/news/${active.id}`} state={linkState} className="news-preview" tabIndex={-1} aria-hidden="true">
                    <Thumbnail src={active.thumbnailUrl} className="news-preview__image" />
                    {active.summary && <p className="news-preview__summary">{active.summary}</p>}
                  </Link>
                )}
              </div>
            )}

            {data.totalPages > 0 && <Pagination page={page} totalPages={data.totalPages} onChange={goPage} />}
          </>
        )}
      </section>
    </div>
  )
}

/** 대표 이미지(본문 최상단 이미지). 없으면 기본 이미지 노출 */
function Thumbnail({ src, className }: { src: string | null; className: string }) {
  return (
    <div className={`news-thumb ${className}`}>
      {src ? <img src={src} alt="" /> : <span className="news-thumb__default">SEMYUNG SOFT</span>}
    </div>
  )
}
