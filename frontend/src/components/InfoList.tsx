import { ReactNode } from 'react'

interface InfoItem {
  label: string
  value: ReactNode
}

interface InfoListProps {
  items: InfoItem[]
  className?: string
}

export default function InfoList({ items, className = '' }: InfoListProps) {
  return (
    <dl className={`space-y-2 ${className}`.trim()}>
      {items.map((item, index) => (
        <div key={index}>
          <dt className="text-sm font-medium text-purdue-gray-500">
            {item.label}
          </dt>
          <dd className="text-lg">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
