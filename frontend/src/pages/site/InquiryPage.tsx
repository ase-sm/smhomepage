import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ApiError, api } from '../../api/client'
import type { InquiryCategory, InquiryRequest } from '../../api/types'
import Modal from '../../components/Modal'
import { ArrowUp02Icon, CheckIcon, EssentialIcon, LogoMark, LogoText } from '../../assets/icons'
import './inquiry.css'

const CATEGORIES: InquiryCategory[] = ['AX', 'R&D', 'Solution', '기타']

type TextField = 'company' | 'name' | 'email' | 'phone' | 'content'

type FieldDef = { key: Exclude<TextField, 'content'>; label: string; placeholder: string; type?: string; max: number }

/** 2열 배치 (Figma: 회사명·이름 / 이메일·연락처) */
const FIELD_ROWS: FieldDef[][] = [
  [
    { key: 'company', label: '회사명', placeholder: '회사명을 입력해 주세요', max: 100 },
    { key: 'name', label: '이름', placeholder: '이름을 입력해 주세요', max: 50 },
  ],
  [
    { key: 'email', label: '이메일', placeholder: '이메일을 입력해 주세요', type: 'email', max: 200 },
    { key: 'phone', label: '연락처', placeholder: '연락처를 입력해 주세요', type: 'tel', max: 20 },
  ],
]

/** 문의 내용 최대 글자 수 (서버 검증과 동일) */
const CONTENT_MAX = 5000

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const PHONE_RE = /^[0-9-]{8,20}$/

const MESSAGES = {
  email: '이메일 형식이 올바르지 않습니다. 예) name@company.com',
  phone: '연락처 형식이 올바르지 않습니다. 숫자와 - 만 입력해 주세요.',
  content: '문의 내용을 10자 이상 입력해 주세요.',
}

const INITIAL: InquiryRequest = {
  category: 'AX',
  company: '',
  name: '',
  email: '',
  phone: '',
  content: '',
  agreed: false,
}

type ModalState = null | 'confirm' | 'failure'

/** 문의하기 (Figma 문의하기 433:13174) */
export default function InquiryPage() {
  const [form, setForm] = useState<InquiryRequest>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<TextField, string>>>({})
  const [modal, setModal] = useState<ModalState>(null)
  const [submitting, setSubmitting] = useState(false)
  /** 접수 완료된 내용 (있으면 접수 완료 화면 노출) */
  const [submitted, setSubmitted] = useState<InquiryRequest | null>(null)
  const location = useLocation()

  // 접수 완료 화면에서 [도입문의] 등으로 다시 들어오면 새 문의 폼 노출
  useEffect(() => {
    setSubmitted(null)
  }, [location.key])

  const allFilled =
    form.company.trim() !== '' &&
    form.name.trim() !== '' &&
    form.email.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.content.trim() !== '' &&
    form.agreed
  const canSubmit = allFilled && !submitting

  const setField = (key: TextField, value: string) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const next: Partial<Record<TextField, string>> = {}
    if (!EMAIL_RE.test(form.email.trim())) next.email = MESSAGES.email
    if (!PHONE_RE.test(form.phone.trim())) next.phone = MESSAGES.phone
    if (form.content.trim().length < 10) next.content = MESSAGES.content
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    // 검증 실패 → 모달 없이 입력란 하단 오류 / 통과 → 등록 확인 모달
    if (validate()) setModal('confirm')
  }

  const send = async () => {
    setModal(null)
    setSubmitting(true)
    try {
      await api.post('/api/inquiries', form)
      setSubmitted(form)
      setForm(INITIAL)
      setErrors({})
      window.scrollTo({ top: 0 })
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && Object.keys(err.errors).length > 0) {
        setErrors(err.errors as Partial<Record<TextField, string>>)
      } else {
        setModal('failure')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted)
    return (
      <InquiryComplete
        data={submitted}
        onBack={() => {
          setSubmitted(null)
          window.scrollTo({ top: 0 })
        }}
      />
    )

  return (
    <div className="inquiry">
      <div className="page-title">
        <p className="page-title__label">문의하기</p>
        <h1 className="page-title__heading">
          세명소프트에 대해
          <br />
          궁금한 점을 문의해 주세요.
        </h1>
      </div>

      <div className="inquiry__body">
        <p className="inquiry__desc">
          문의하신 내용에 대한 답변은 작성해주신
          <br />
          이메일로 안내해 드립니다.
        </p>

        <form className="inquiry-form" onSubmit={handleSubmitClick} noValidate>
          <div className="inquiry-form__fields">
            <div className="inquiry-form__group">
              <FieldLabel id="label-category" required>
                문의 주제
              </FieldLabel>
              <div className="inquiry-form__categories" role="radiogroup" aria-labelledby="label-category">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={form.category === c}
                    className={`inquiry-category${form.category === c ? ' is-selected' : ''}`}
                    onClick={() => setForm((f) => ({ ...f, category: c }))}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {FIELD_ROWS.map((row) => (
              <div key={row[0].key} className="inquiry-form__pair">
                {row.map((f) => (
                  <div key={f.key} className="inquiry-form__group">
                    <FieldLabel htmlFor={`inq-${f.key}`} required>
                      {f.label}
                    </FieldLabel>
                    <input
                      id={`inq-${f.key}`}
                      className={`base-input${errors[f.key] ? ' has-error' : ''}`}
                      type={f.type ?? 'text'}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      maxLength={f.max}
                      onChange={(e) => setField(f.key, e.target.value)}
                      aria-invalid={!!errors[f.key]}
                      aria-describedby={errors[f.key] ? `err-${f.key}` : undefined}
                      autoComplete={f.key === 'company' ? 'organization' : f.key === 'phone' ? 'tel' : f.key}
                    />
                    {errors[f.key] && (
                      <p id={`err-${f.key}`} className="inquiry-form__error">
                        {errors[f.key]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div className="inquiry-form__group">
              <FieldLabel htmlFor="inq-content">문의 내용</FieldLabel>
              <textarea
                id="inq-content"
                className={`base-input base-textarea${errors.content ? ' has-error' : ''}`}
                placeholder="내용을 입력해 주세요"
                maxLength={CONTENT_MAX}
                value={form.content}
                onChange={(e) => setField('content', e.target.value)}
                aria-invalid={!!errors.content}
                aria-describedby={errors.content ? 'err-content' : 'count-content'}
              />
              <div className="inquiry-form__helper">
                {errors.content && (
                  <p id="err-content" className="inquiry-form__error">
                    {errors.content}
                  </p>
                )}
                <p id="count-content" className="inquiry-form__counter">
                  <span className="inquiry-form__counter-now">{form.content.length}</span>/{CONTENT_MAX}
                </p>
              </div>
            </div>
          </div>

          <div className="inquiry-form__agree">
            <Checkbox
              label="[필수] 개인정보 수집 및 이용에 동의합니다."
              checked={form.agreed}
              onChange={() => setForm((f) => ({ ...f, agreed: !f.agreed }))}
            />
            <p className="inquiry-form__privacy">
              문의 사항에 대한 답변 및 고객 관리를 위해 개인정보(회사명, 이름, 이메일, 연락처)를 수집, 이용합니다.
              수집된 정보는 세명소프트의 개인정보 처리 방침에 따라 보관 및 사용되며, 개인 정보는 3개월 보존 후
              파기합니다.
            </p>
            <p className="inquiry-form__tel">대표 번호 070-7605-3328 / 070-7605-3329</p>
          </div>

          <button type="submit" className="inquiry-form__submit" disabled={!canSubmit} aria-busy={submitting}>
            {submitting && <span className="spinner" aria-hidden="true" />}
            문의하기
          </button>
        </form>
      </div>

      <Modal
        open={modal === 'confirm'}
        message={'문의를 등록하시겠습니까?\n입력하신 연락처로 담당자가 회신드립니다.'}
        onCancel={() => setModal(null)}
        onConfirm={send}
      />
      <Modal
        open={modal === 'failure'}
        message={'전송에 실패했습니다.\n잠시 후 다시 시도해 주세요.'}
        onConfirm={() => setModal(null)}
      />
    </div>
  )
}

/** 접수 완료 화면 (Figma mail 319:16594 — 접수 확인 메일과 같은 구성) */
function InquiryComplete({ data, onBack }: { data: InquiryRequest; onBack: () => void }) {
  const rows: [string, string][] = [
    ['구분', data.category],
    ['회사명', data.company.trim()],
    ['이름', data.name.trim()],
    ['이메일', data.email.trim()],
    ['연락처', data.phone.trim()],
    ['문의 내용', data.content.trim()],
  ]
  return (
    <section className="inquiry-done" aria-labelledby="inquiry-done-title">
      <button type="button" className="inquiry-done__back" onClick={onBack} aria-label="문의하기로 돌아가기">
        <ArrowUp02Icon aria-hidden="true" />
      </button>

      <span className="inquiry-done__logo" aria-label="세명소프트" role="img">
        <LogoMark className="inquiry-done__logo-mark" aria-hidden="true" />
        <LogoText className="inquiry-done__logo-text" aria-hidden="true" />
      </span>

      <div className="inquiry-done__main">
        <div className="inquiry-done__head">
          <h1 id="inquiry-done-title" className="inquiry-done__title">
            문의가 정상 접수되었습니다.
          </h1>
          <p className="inquiry-done__desc">
            {data.name.trim()}님, 문의해 주셔서 감사합니다.
            <br />
            아래 내용으로 접수되었으며 담당자가 확인 후 순차적으로 회신드리겠습니다.
          </p>
        </div>

        <div className="inquiry-done__receipt">
          <h2 className="inquiry-done__subtitle">접수 내용</h2>
          <dl className="inquiry-done__list">
            {rows.map(([label, value]) => (
              <div key={label} className="inquiry-done__row">
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="inquiry-done__footer">
          <p>주식회사 세명소프트&nbsp;&nbsp;|&nbsp;&nbsp;대표이사 황바울</p>
          <p>서울 중구 청계천로 100 시그니처타워 서관 1033호 (본사)&nbsp;&nbsp;|&nbsp;&nbsp;help@smsoft.kr</p>
          <p>접수 확인 메일을 입력하신 이메일로 발송했습니다.</p>
        </div>
      </div>
    </section>
  )
}

function FieldLabel({
  children,
  required,
  htmlFor,
  id,
}: {
  children: string
  required?: boolean
  htmlFor?: string
  id?: string
}) {
  const content = (
    <>
      {children}
      {required && <EssentialIcon className="inquiry-form__essential" aria-label="필수" role="img" />}
    </>
  )
  return htmlFor ? (
    <label className="inquiry-form__label" htmlFor={htmlFor}>
      {content}
    </label>
  ) : (
    <span className="inquiry-form__label" id={id}>
      {content}
    </span>
  )
}

function Checkbox({
  label,
  checked,
  onChange,
  role = 'checkbox',
}: {
  label: string
  checked: boolean
  onChange: () => void
  role?: 'checkbox' | 'radio'
}) {
  return (
    <button type="button" role={role} aria-checked={checked} className="checkbox" onClick={onChange}>
      <span className={`checkbox__box${checked ? ' is-checked' : ''}`}>
        {checked && (
          <span className="checkbox__icon">
            <CheckIcon width={14} height={14} aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="checkbox__label">{label}</span>
    </button>
  )
}
