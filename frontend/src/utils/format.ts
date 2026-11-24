/** 'YYYY-MM-DD' 또는 ISO 일시 → 'YYYY.MM.DD' */
export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  return value.slice(0, 10).replaceAll('-', '.')
}

/** ISO 일시 → 'YYYY.MM.DD  HH:mm' */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return ''
  const [date, time = ''] = value.split('T')
  return `${formatDate(date)}  ${time.slice(0, 5)}`.trim()
}

/** 오늘 날짜 (로컬, 'YYYY-MM-DD') */
export function todayString(): string {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}
