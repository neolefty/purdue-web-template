interface StatCardProps {
  value: string | number
  label: string
  color?: 'gold' | 'gray' | 'default'
}

export default function StatCard({
  value,
  label,
  color = 'gold'
}: StatCardProps) {
  const colorClasses = {
    gold: 'text-purdue-gold',
    gray: 'text-purdue-gray-600',
    default: 'text-purdue-black'
  }

  return (
    <div className="text-center">
      <span className={`text-stat ${colorClasses[color]}`}>
        {value}
      </span>
      <span className="text-caption text-purdue-gray-600 block">
        {label}
      </span>
    </div>
  )
}
