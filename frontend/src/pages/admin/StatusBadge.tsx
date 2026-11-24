import { NEWS_STATUS_LABEL, type NewsStatus } from '../../api/types'

export default function StatusBadge({ status }: { status: NewsStatus }) {
  return <span className={`status-badge status-badge--${status.toLowerCase()}`}>{NEWS_STATUS_LABEL[status]}</span>
}
