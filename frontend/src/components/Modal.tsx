import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

interface ModalProps {
  open: boolean
  message: React.ReactNode
  confirmText?: string
  cancelText?: string
  /** 지정 시 [취소] 버튼 노출 */
  onCancel?: () => void
  onConfirm: () => void
  /** 관리자 화면 스타일 (각진 버튼) */
  variant?: 'site' | 'admin'
}

export default function Modal({
  open,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onCancel,
  onConfirm,
  variant = 'site',
}: ModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    confirmRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') (onCancel ?? onConfirm)()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  return createPortal(
    <div className={`modal-backdrop modal--${variant}`} role="presentation">
      <div className="modal" role="alertdialog" aria-modal="true" aria-describedby="modal-message">
        <div id="modal-message" className="modal__message">
          {message}
        </div>
        <div className="modal__actions">
          {onCancel && (
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button ref={confirmRef} type="button" className="modal__btn modal__btn--confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
