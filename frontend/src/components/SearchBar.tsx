import { ReactNode } from 'react'
import clsx from 'clsx'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rightContent?: ReactNode
  className?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  rightContent,
  className = ''
}: SearchBarProps) {
  return (
    <div className={clsx('flex flex-col md:flex-row gap-4 items-center', className)}>
      <div className="flex-1 w-full">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-purdue-gray-300 rounded-md focus:ring-2 focus:ring-purdue-gold focus:border-transparent"
        />
      </div>
      {rightContent && (
        <div className="flex items-center gap-4">
          {rightContent}
        </div>
      )}
    </div>
  )
}
