/* global HTMLInputElement */
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  rightContent?: ReactNode
}

/**
 * Reusable form field component with label, input, error display, and optional hint
 */
const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, rightContent, className = '', id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor={inputId} className="label">
            {label}
          </label>
          {rightContent}
        </div>
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        {hint && !error && (
          <p className="mt-1 text-xs text-purdue-gray-500">{hint}</p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export default FormField
