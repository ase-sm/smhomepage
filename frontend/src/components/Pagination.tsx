import { ArrowLeft20Icon, ArrowRight20Icon, EllipsisIcon } from '../assets/icons'
import './Pagination.css'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  /** site: 홈페이지 (Figma Pagination 468:13012) / admin: 관리자 */
  variant?: 'site' | 'admin'
  /** 한 번에 노출할 페이지 번호 수 (기본: site 5, admin 10) */
  windowSize?: number
}

export default function Pagination({ page, totalPages, onChange, variant = 'site', windowSize }: PaginationProps) {
  if (totalPages < 1) return null

  const size = windowSize ?? (variant === 'site' ? 5 : 10)
  const start = Math.floor((page - 1) / size) * size + 1
  const end = Math.min(totalPages, start + size - 1)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)
  const isSite = variant === 'site'

  return (
    <nav className={`pagination pagination--${variant}`} aria-label="페이지 이동">
      <button
        type="button"
        className="pagination__item pagination__arrow"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="이전 페이지"
      >
        {isSite ? <ArrowLeft20Icon aria-hidden="true" /> : '‹'}
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__item${p === page ? ' is-active' : ''}`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => p !== page && onChange(p)}
        >
          {p}
        </button>
      ))}
      {isSite && end < totalPages && (
        <button
          type="button"
          className="pagination__item pagination__ellipsis"
          onClick={() => onChange(end + 1)}
          aria-label={`${end + 1}페이지로 이동`}
        >
          <EllipsisIcon aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        className="pagination__item pagination__arrow"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="다음 페이지"
      >
        {isSite ? <ArrowRight20Icon aria-hidden="true" /> : '›'}
      </button>
    </nav>
  )
}
