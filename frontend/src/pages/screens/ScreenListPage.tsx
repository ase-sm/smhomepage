import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { SCREEN_GROUPS, STATUS_LABEL, type Screen, type ScreenStatus } from './screens'
import './screens.css'

type Filter = 'all' | ScreenStatus
const FILTERS: Filter[] = ['all', 'done', 'partial', 'todo', 'hidden']

function ScreenLink({ screen }: { screen: Screen }) {
  if (screen.href) {
    return (
      <a href={screen.href} target="_blank" rel="noreferrer" className="screens__link">
        {screen.href.replace(/^https?:\/\//, '')}
      </a>
    )
  }
  if (screen.path) {
    return (
      <Link to={screen.path} target="_blank" className="screens__link">
        {screen.path}
      </Link>
    )
  }
  return <span className="screens__muted">-</span>
}

/** 화면 목록 (기획서 N-메뉴구조도-01 의 화면 목록 표 + 구현 경로·상태) */
export default function ScreenListPage() {
  const [filter, setFilter] = useState<Filter>('all')
  const [keyword, setKeyword] = useState('')

  const all = useMemo(() => SCREEN_GROUPS.flatMap((g) => g.screens), [])
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: all.length, done: 0, partial: 0, todo: 0, hidden: 0 }
    all.forEach((s) => c[s.status]++)
    return c
  }, [all])
  const progress = Math.round((counts.done / (all.length - counts.hidden)) * 100)

  const q = keyword.trim().toLowerCase()
  const match = (s: Screen) =>
    (filter === 'all' || s.status === filter) &&
    (!q || [s.id, s.name, s.entry, s.parts, s.path ?? ''].some((v) => v.toLowerCase().includes(q)))

  return (
    <div className="screens">
      <header className="screens__head">
        <div>
          <p className="screens__project">세명소프트 홈페이지 개편</p>
          <h1 className="screens__title">화면 목록</h1>
        </div>
        <div className="screens__progress" aria-label={`구현 진행률 ${progress}%`}>
          <div className="screens__progress-text">
            <span>구현 진행률</span>
            <strong>{progress}%</strong>
          </div>
          <div className="screens__progress-bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="screens__muted">
            전체 {all.length - counts.hidden}개 중 {counts.done}개 완료 (숨김 제외)
          </p>
        </div>
      </header>

      <div className="screens__tools">
        <div className="screens__filters" role="group" aria-label="상태 필터">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`screens__filter${filter === f ? ' is-active' : ''}`}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '전체' : STATUS_LABEL[f]}
              <span className="screens__filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          className="screens__search"
          placeholder="화면 ID, 화면명, 경로 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      {SCREEN_GROUPS.map((group) => {
        const rows = group.screens.filter(match)
        return (
          <section key={group.key} className="screens__section">
            <h2 className="screens__section-title">
              {group.title}
              <span className="screens__section-count">{rows.length}</span>
            </h2>
            <p className="screens__section-desc">{group.description}</p>

            <div className="screens__table-wrap">
              <table className="screens__table">
                <colgroup>
                  <col className="col-id" />
                  <col className="col-name" />
                  <col className="col-depth" />
                  <col className="col-entry" />
                  <col className="col-parts" />
                  <col className="col-path" />
                  <col className="col-status" />
                </colgroup>
                <thead>
                  <tr>
                    <th>화면 ID</th>
                    <th>화면명</th>
                    <th>Depth</th>
                    <th>진입 경로</th>
                    <th>주요 구성</th>
                    <th>주소</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="screens__empty">
                        조건에 맞는 화면이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    rows.map((s, i) => (
                      <tr key={`${s.id}-${i}`}>
                        <td className="screens__id">{s.id}</td>
                        <td className="screens__name">
                          {s.name}
                          {s.note && <span className="screens__note">{s.note}</span>}
                        </td>
                        <td>{s.depth}</td>
                        <td>{s.entry}</td>
                        <td>{s.parts}</td>
                        <td>
                          <ScreenLink screen={s} />
                        </td>
                        <td>
                          <span className={`screens__badge screens__badge--${s.status}`}>{STATUS_LABEL[s.status]}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )
      })}

      <ul className="screens__legend">
        <li>
          <span className="screens__badge screens__badge--done">완료</span> 기획서 기준 구현 완료
        </li>
        <li>
          <span className="screens__badge screens__badge--partial">준비 중</span> 주소와 메뉴는 있지만 콘텐츠는 준비 중
        </li>
        <li>
          <span className="screens__badge screens__badge--todo">미구현</span> 아직 만들지 않은 화면
        </li>
        <li>
          <span className="screens__badge screens__badge--hidden">숨김</span> 기획상 오픈 전까지 숨기는 화면
        </li>
      </ul>
    </div>
  )
}
