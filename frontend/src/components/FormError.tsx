import { ReactNode } from 'react'
import { formatApiErrors } from '@/utils/errors'

interface FormErrorProps {
  error: unknown
  children?: ReactNode
}

/**
 * Reusable form error display component
 * Can accept an API error object or render custom children
 */
export default function FormError({ error, children }: FormErrorProps) {
  if (!error && !children) return null

  return (
    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
      {children || formatApiErrors(error)}
    </div>
  )
}

interface FormSuccessProps {
  message?: string
  children?: ReactNode
}

/**
 * Reusable form success display component
 */
export function FormSuccess({ message, children }: FormSuccessProps) {
  if (!message && !children) return null

  return (
    <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
      {children || message}
    </div>
  )
}
