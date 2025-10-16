import { type ReactNode } from 'react'
import Modal, { ModalBody, ModalFooter } from '@/components/Modal'
import Button from '@/components/Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title?: string
  message: string
  details?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  details,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm()
  }

  const variantStyles = {
    danger: {
      buttonVariant: 'danger' as const,
      warningClass: 'text-red-600'
    },
    warning: {
      buttonVariant: 'primary' as const,
      warningClass: 'text-yellow-600'
    },
    info: {
      buttonVariant: 'primary' as const,
      warningClass: 'text-purdue-gray-700'
    }
  }

  const style = variantStyles[variant]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <ModalBody>
        <p className="text-purdue-gray-700">
          {message}
        </p>

        {details && (
          <div className="mt-4">
            {details}
          </div>
        )}

        {variant === 'danger' && (
          <p className={`text-sm mt-4 ${style.warningClass}`}>
            This action cannot be undone.
          </p>
        )}
      </ModalBody>

      <ModalFooter className="flex justify-end space-x-3">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelText}
        </Button>
        <Button
          variant={style.buttonVariant}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
