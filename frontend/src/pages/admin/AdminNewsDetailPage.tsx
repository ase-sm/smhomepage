import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError, api } from '../../api/client'
import type { AdminNewsDetail } from '../../api/types'
import Modal from '../../components/Modal'
import { formatDate, formatDateTime } from '../../utils/format'
import StatusBadge from './StatusBadge'

interface ListState {
  listSearch?: string
}

export default function AdminNewsDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const listSearch = (location.state as ListState | null)?.listSearch ?? ''
  const [news, setNews] = useState<AdminNewsDetail | null>(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<null | 'delete' | 'deleteFailed'>(null)

  useEffect(() => {
    api
      .get<AdminNewsDetail>(`/api/admin/news/${id}`)
      .then(setNews)
      .catch((e) =>
        setError(e instanceof ApiError && e.status === 404 ? '해당 뉴스를 찾을 수 없습니다.' : '뉴스를 불러오지 못했습니다.'),
      )
  }, [id])

  const handleDelete = async () => {
    setModal(null)
    try {
      await api.delete(`/api/admin/news/${id}`)
      navigate('/admin/news', { replace: true })
    } catch {
      setModal('deleteFailed')
    }
  }

  if (error) {
    return (
      <div className="admin-page">
        <p className="admin-error">{error}</p>
        <div className="admin-bottom">
          <button type="button" className="admin-btn admin-btn--outline admin-btn--lg" onClick={() => navigate('/admin/news')}>
            목록
          </button>
        </div>
      </div>
    )
  }
  if (!news) return <div className="admin-page" aria-busy="true" />

  return (
    <div className="admin-page admin-page--form">
      <div className="admin-page__head admin-page__head--start">
        <h1 className="admin-page__title">뉴스 상세</h1>
        <p className="admin-page__breadcrumb">뉴스 관리 &gt; 상세</p>
      </div>

      <dl className="admin-info">
        <div className="admin-info__row">
          <dt>제목</dt>
          <dd className="admin-info__title">{news.title}</dd>
        </div>
        <div className="admin-info__row">
          <dt>요약</dt>
          <dd className="admin-info__pre">{news.summary || <span className="admin-info__muted">요약 없음</span>}</dd>
        </div>
        <div className="admin-info__row">
          <dt>출처</dt>
          <dd>
            {news.sourceName ? (
              <div className="admin-info__source">
                <span>{news.sourceName}</span>
                {news.sourceUrl && (
                  <a href={news.sourceUrl} target="_blank" rel="noopener noreferrer" className="admin-info__link">
                    {news.sourceUrl}
                  </a>
                )}
              </div>
            ) : (
              <span className="admin-info__muted">출처 없음</span>
            )}
          </dd>
        </div>
        <div className="admin-info__row">
          <dt>상태</dt>
          <dd>
            <div className="admin-info__status">
              <StatusBadge status={news.status} />
              {news.status === 'SCHEDULED' && (
                <span className="admin-info__scheduled">{formatDate(news.publishDate)} 예정</span>
              )}
            </div>
          </dd>
          <dt>게시일</dt>
          <dd className="is-num">{formatDate(news.publishDate)}</dd>
        </div>
        <div className="admin-info__row">
          <dt>등록자</dt>
          <dd>{news.createdBy}</dd>
          <dt>최종 수정일</dt>
          <dd className="is-num admin-info__pre">{formatDateTime(news.updatedAt)}</dd>
        </div>
      </dl>

      <section className="admin-detail-body">
        <h2 className="admin-detail-body__title">본문</h2>
        <div className="admin-detail-body__box">
          <div className="rich-content admin-detail-body__content" dangerouslySetInnerHTML={{ __html: news.content }} />
        </div>
      </section>

      <div className="admin-bottom">
        <div className="admin-bottom__left">
          <button
            type="button"
            className="admin-btn admin-btn--outline admin-btn--lg"
            onClick={() => navigate(`/admin/news${listSearch}`)}
          >
            목록
          </button>
        </div>
        <div className="admin-bottom__right">
          <button type="button" className="admin-btn admin-btn--danger admin-btn--lg" onClick={() => setModal('delete')}>
            삭제
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--dark admin-btn--xl"
            onClick={() => navigate(`/admin/news/${news.id}/edit`, { state: { listSearch } })}
          >
            수정
          </button>
        </div>
      </div>

      <Modal
        variant="admin"
        open={modal === 'delete'}
        message={'삭제한 뉴스는 복구할 수 없습니다.\n삭제하시겠습니까?'}
        confirmText="삭제"
        onCancel={() => setModal(null)}
        onConfirm={() => void handleDelete()}
      />
      <Modal
        variant="admin"
        open={modal === 'deleteFailed'}
        message={'삭제에 실패했습니다.\n잠시 후 다시 시도해 주세요.'}
        onConfirm={() => setModal(null)}
      />
    </div>
  )
}
