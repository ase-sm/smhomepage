import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError, api } from '../../api/client'
import type { NewsDetail } from '../../api/types'
import { formatDate } from '../../utils/format'
import './news.css'

interface ListState {
  listSearch?: string
}

/** 뉴스 상세 (Figma News_상세 433:12746) */
export default function NewsDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listSearch = (location.state as ListState | null)?.listSearch ?? ''
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setNews(null)
    setError(false)
    api
      .get<NewsDetail>(`/api/news/${id}`)
      .then((d) => !cancelled && setNews(d))
      .catch((e) => {
        if (cancelled) return
        // 없는 뉴스 / 예약·비공개 뉴스는 목록으로 이동
        if (e instanceof ApiError && (e.status === 404 || e.status === 400)) {
          navigate('/news', { replace: true })
        } else {
          setError(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  if (error) {
    return <p className="news-empty">뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
  }
  if (!news) return <div className="news-detail" aria-busy="true" />

  return (
    <article className="news-detail">
      <header className="news-detail__head">
        <div className="news-detail__heading">
          <h1 className="news-detail__title">{news.title}</h1>
          <p className="news-detail__date">{formatDate(news.publishDate)}</p>
        </div>
      </header>

      <div className="news-detail__body">
        {news.summary && <p className="news-detail__summary">{news.summary}</p>}

        <div className="rich-content news-detail__content" dangerouslySetInnerHTML={{ __html: news.content }} />

        {news.sourceName && (
          <div className="news-detail__source">
            <span>출처</span>
            <span>{news.sourceName}</span>
            {news.sourceUrl && (
              <a className="news-detail__source-link" href={news.sourceUrl} target="_blank" rel="noopener noreferrer">
                &lt;원문 보기&gt;
              </a>
            )}
          </div>
        )}
      </div>

      <div className="news-detail__bottom">
        <Link to={`/news${listSearch}`} className="news-detail__list-button">
          목록으로
        </Link>
      </div>
    </article>
  )
}
