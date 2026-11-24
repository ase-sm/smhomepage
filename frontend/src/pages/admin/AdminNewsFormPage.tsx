import { useEffect, useRef, useState } from 'react'
import { useBlocker, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ApiError, api } from '../../api/client'
import type { AdminNewsDetail, NewsRequest } from '../../api/types'
import Modal from '../../components/Modal'
import { formatDate, todayString } from '../../utils/format'
import RichEditor from './RichEditor'
import { RadioOffIcon, RadioOnIcon } from '../../assets/icons'

type Field = 'title' | 'summary' | 'content' | 'sourceName' | 'sourceUrl' | 'publishDate'
type Errors = Partial<Record<Field, string>>

const FIELD_ORDER: Field[] = ['title', 'summary', 'content', 'sourceName', 'sourceUrl', 'publishDate']
const URL_RE = /^https?:\/\/\S+$/

const EMPTY: NewsRequest = {
  title: '',
  summary: '',
  content: '',
  sourceName: '',
  sourceUrl: '',
  published: true,
  publishDate: todayString(),
}

interface ListState {
  listSearch?: string
}

type ModalState =
  | null
  | { kind: 'scheduled' }
  | { kind: 'saved' }
  | { kind: 'saveFailed' }
  | { kind: 'delete' }
  | { kind: 'deleteFailed' }
  | { kind: 'alert'; message: string }

export default function AdminNewsFormPage() {
  const { id } = useParams()
  const isEdit = id !== undefined
  const navigate = useNavigate()
  const location = useLocation()
  const listSearch = (location.state as ListState | null)?.listSearch ?? ''

  const [form, setForm] = useState<NewsRequest>(EMPTY)
  const [contentEmpty, setContentEmpty] = useState(true)
  const [loaded, setLoaded] = useState(!isEdit)
  const [loadError, setLoadError] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const skipBlockRef = useRef(false)
  const dateRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isEdit) return
    api
      .get<AdminNewsDetail>(`/api/admin/news/${id}`)
      .then((d) => {
        setForm({
          title: d.title,
          summary: d.summary ?? '',
          content: d.content,
          sourceName: d.sourceName ?? '',
          sourceUrl: d.sourceUrl ?? '',
          published: d.published,
          publishDate: d.publishDate,
        })
        setContentEmpty(false)
        setLoaded(true)
      })
      .catch(() => setLoadError(true))
  }, [id, isEdit])

  // 입력 중 이탈 시 확인 모달
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !skipBlockRef.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const set = <K extends keyof NewsRequest>(key: K, value: NewsRequest[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
    if (errors[key as Field]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (!form.title.trim()) e.title = '제목을 입력해 주세요.'
    else if (form.title.length > 60) e.title = '제목은 60자까지 입력할 수 있습니다.'
    if (form.summary.length > 100) e.summary = '요약은 100자까지 입력할 수 있습니다.'
    if (contentEmpty) e.content = '본문을 입력해 주세요.'
    const sourceUrl = form.sourceUrl.trim()
    if (sourceUrl && !URL_RE.test(sourceUrl)) e.sourceUrl = '링크는 http:// 또는 https:// 로 시작해야 합니다.'
    if (sourceUrl && !form.sourceName.trim()) e.sourceName = '원문 링크를 입력한 경우 출처명을 입력해 주세요.'
    if (!form.publishDate) e.publishDate = '게시일을 선택해 주세요.'
    return e
  }

  const showErrors = (e: Errors) => {
    setErrors(e)
    // 첫 오류 항목으로 스크롤
    const first = FIELD_ORDER.find((f) => e[f])
    if (first) {
      const el = document.getElementById(`field-${first}`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus({ preventScroll: true })
    }
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length > 0) return showErrors(e)
    if (form.published && form.publishDate > todayString()) {
      setModal({ kind: 'scheduled' })
      return
    }
    void save()
  }

  const save = async () => {
    setModal(null)
    setSaving(true)
    try {
      const body: NewsRequest = { ...form, title: form.title.trim() }
      if (isEdit) await api.put(`/api/admin/news/${id}`, body)
      else await api.post('/api/admin/news', body)
      setDirty(false)
      setModal({ kind: 'saved' })
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && Object.keys(err.errors).length > 0) {
        showErrors(err.errors as Errors)
      } else {
        setModal({ kind: 'saveFailed' })
      }
    } finally {
      setSaving(false)
    }
  }

  const leave = (to: string, state?: unknown) => {
    navigate(to, { state })
  }

  const goBack = () => {
    // 진입 경로로 복귀 - 등록은 목록, 수정은 상세
    if (isEdit) leave(`/admin/news/${id}`, { listSearch })
    else leave(`/admin/news${listSearch}`)
  }

  const handleDelete = async () => {
    setModal(null)
    try {
      await api.delete(`/api/admin/news/${id}`)
      skipBlockRef.current = true
      navigate('/admin/news', { replace: true })
    } catch {
      setModal({ kind: 'deleteFailed' })
    }
  }

  if (loadError) {
    return (
      <div className="admin-page">
        <p className="admin-error">뉴스를 불러오지 못했습니다.</p>
      </div>
    )
  }
  if (!loaded) return <div className="admin-page" aria-busy="true" />

  return (
    <div className="admin-page admin-page--form">
      <div className="admin-page__head admin-page__head--start">
        <h1 className="admin-page__title">{isEdit ? '뉴스 수정' : '뉴스 등록'}</h1>
        <p className="admin-page__breadcrumb">뉴스 관리 &gt; {isEdit ? '수정' : '등록'}</p>
      </div>

      <div className="admin-form">
        <FormRow label="제목" required>
          <div className={`admin-input admin-input--counter${errors.title ? ' has-error' : ''}`}>
            <input
              id="field-title"
              placeholder="제목을 입력해 주세요."
              maxLength={60}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
            <span className="admin-counter">{form.title.length} / 60</span>
          </div>
          <FieldError message={errors.title} />
        </FormRow>

        <FormRow label="요약">
          <div className={`admin-textarea${errors.summary ? ' has-error' : ''}`}>
            <textarea
              id="field-summary"
              placeholder="요약문을 입력해 주세요."
              maxLength={100}
              rows={2}
              value={form.summary}
              onChange={(e) => set('summary', e.target.value)}
            />
            <span className="admin-counter">{form.summary.length} / 100</span>
          </div>
          <FieldError message={errors.summary} />
          <p className="admin-help">상세 화면 제목 아래 리드 문단으로 노출되며, 입력한 줄바꿈을 그대로 반영합니다. (최대 3줄)</p>
        </FormRow>

        <FormRow label="본문" required>
          <RichEditor
            id="field-content"
            initialContent={form.content}
            invalid={!!errors.content}
            onChange={(html, empty) => {
              setForm((f) => ({ ...f, content: html }))
              setContentEmpty(empty)
              setDirty(true)
              if (errors.content) setErrors((e) => ({ ...e, content: undefined }))
            }}
            onError={(message) => setModal({ kind: 'alert', message })}
          />
          <FieldError message={errors.content} />
          <p className="admin-help">
            이미지는 본문 안에 직접 삽입합니다. JPG · JPEG · PNG · GIF, 장당 10MB 이하. 업로드 시 가로 1600px 기준으로
            자동 리사이즈되며, 본문 폭에 맞춰 노출됩니다. 본문 최상단 이미지가 목록의 대표 이미지로 사용됩니다.
          </p>
        </FormRow>

        <FormRow label="출처">
          <div className="admin-form__source">
            <input
              id="field-sourceName"
              className={`admin-input admin-form__source-name${errors.sourceName ? ' has-error' : ''}`}
              placeholder="출처명  예) 전자신문"
              maxLength={100}
              value={form.sourceName}
              onChange={(e) => set('sourceName', e.target.value)}
            />
            <input
              id="field-sourceUrl"
              className={`admin-input admin-form__source-url${errors.sourceUrl ? ' has-error' : ''}`}
              placeholder="원문 링크  예) https://www.etnews.com/..."
              maxLength={1000}
              value={form.sourceUrl}
              onChange={(e) => set('sourceUrl', e.target.value)}
            />
          </div>
          <FieldError message={errors.sourceName ?? errors.sourceUrl} />
          <p className="admin-help">
            언론 보도나 외부 자료를 인용한 경우 입력합니다. 입력 시 상세 화면 본문 하단에 노출됩니다.
          </p>
        </FormRow>

        <FormRow label="공개 여부" required>
          <div className="admin-radios" role="radiogroup" aria-label="공개 여부">
            <Radio label="공개" checked={form.published} onSelect={() => set('published', true)} />
            <Radio label="비공개" checked={!form.published} onSelect={() => set('published', false)} />
          </div>
          <p className="admin-help">비공개로 저장하면 게시일과 상관없이 홈페이지에 노출되지 않습니다.</p>
        </FormRow>

        <FormRow label="게시일" required>
          <div className={`admin-input admin-date${errors.publishDate ? ' has-error' : ''}`}>
            <input
              id="field-publishDate"
              ref={dateRef}
              type="date"
              value={form.publishDate}
              onChange={(e) => set('publishDate', e.target.value)}
            />
            <button
              type="button"
              className="calendar-icon"
              aria-label="날짜 선택"
              onClick={() => dateRef.current?.showPicker?.()}
            >
              <span className="calendar-icon__body" />
              <span className="calendar-icon__bar" />
              <span className="calendar-icon__leg calendar-icon__leg--0" />
              <span className="calendar-icon__leg calendar-icon__leg--1" />
            </button>
          </div>
          <FieldError message={errors.publishDate} />
          <p className="admin-help">
            홈페이지에 표시되는 날짜이며 목록 정렬 기준입니다. 오늘 이후 날짜를 선택하면 해당 날짜 00시에 자동 등록됩니다.
          </p>
        </FormRow>
      </div>

      <div className="admin-bottom">
        <div className="admin-bottom__left">
          <button type="button" className="admin-btn admin-btn--outline admin-btn--lg" onClick={goBack}>
            목록
          </button>
        </div>
        <div className="admin-bottom__right">
          {isEdit && (
            <button
              type="button"
              className="admin-btn admin-btn--danger admin-btn--lg"
              onClick={() => setModal({ kind: 'delete' })}
            >
              삭제
            </button>
          )}
          <button
            type="button"
            className="admin-btn admin-btn--dark admin-btn--xl"
            onClick={handleSave}
            disabled={saving}
          >
            저장
          </button>
        </div>
      </div>

      <Modal
        variant="admin"
        open={blocker.state === 'blocked'}
        message="내용이 저장되지 않습니다. 이동하시겠습니까?"
        onCancel={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
      />
      <Modal
        variant="admin"
        open={modal?.kind === 'scheduled'}
        message={`${formatDate(form.publishDate)}에 공개됩니다. 저장하시겠습니까?`}
        onCancel={() => setModal(null)}
        onConfirm={() => void save()}
      />
      <Modal
        variant="admin"
        open={modal?.kind === 'saved'}
        message="저장되었습니다."
        onConfirm={() => {
          skipBlockRef.current = true
          setModal(null)
          // 등록 완료 후 목록 1페이지 / 수정 완료 후 목록(직전 조건 유지)
          navigate(isEdit ? `/admin/news${listSearch}` : '/admin/news', { replace: true })
        }}
      />
      <Modal
        variant="admin"
        open={modal?.kind === 'saveFailed'}
        message={'저장에 실패했습니다.\n잠시 후 다시 시도해 주세요.'}
        onConfirm={() => setModal(null)}
      />
      <Modal
        variant="admin"
        open={modal?.kind === 'delete'}
        message={'삭제한 뉴스는 복구할 수 없습니다.\n삭제하시겠습니까?'}
        confirmText="삭제"
        onCancel={() => setModal(null)}
        onConfirm={() => void handleDelete()}
      />
      <Modal
        variant="admin"
        open={modal?.kind === 'deleteFailed'}
        message={'삭제에 실패했습니다.\n잠시 후 다시 시도해 주세요.'}
        onConfirm={() => setModal(null)}
      />
      <Modal
        variant="admin"
        open={modal?.kind === 'alert'}
        message={modal?.kind === 'alert' ? modal.message : ''}
        onConfirm={() => setModal(null)}
      />
    </div>
  )
}

function FormRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="admin-form__row">
      <div className="admin-form__label">
        <span>{label}</span>
        {required && <span className="admin-form__required">*</span>}
      </div>
      <div className="admin-form__input">{children}</div>
    </div>
  )
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="admin-error">{message}</p> : null
}

function Radio({ label, checked, onSelect }: { label: string; checked: boolean; onSelect: () => void }) {
  return (
    <button type="button" role="radio" aria-checked={checked} className="admin-radio" onClick={onSelect}>
      {checked ? (
        <RadioOnIcon width={18} height={18} aria-hidden="true" />
      ) : (
        <RadioOffIcon width={18} height={18} aria-hidden="true" />
      )}
      <span>{label}</span>
    </button>
  )
}
