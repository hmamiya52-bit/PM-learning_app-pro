import { Link } from 'react-router-dom'

interface StudyModeButtonProps {
  to: string
  label: string
  description: string
  icon: string
  variant: 'primary' | 'secondary'
}

export default function StudyModeButton({
  to,
  label,
  description,
  icon,
  variant,
}: StudyModeButtonProps) {
  const isPrimary = variant === 'primary'

  return (
    <Link
      to={to}
      className={[
        'flex items-center gap-3 rounded-xl px-5 py-4 min-h-[56px]',
        'transition-all duration-150 select-none',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isPrimary
          ? 'bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-amber-950 shadow-md hover:shadow-lg focus-visible:ring-amber-400'
          : 'bg-blue-800 hover:bg-blue-700 active:bg-blue-900 text-white shadow focus-visible:ring-blue-400',
      ].join(' ')}
      aria-label={`${label} — ${description}`}
    >
      <span className="text-2xl leading-none" aria-hidden="true">
        {icon}
      </span>
      <span className="flex flex-col items-start gap-0.5 text-left">
        <span className={`font-bold text-base leading-tight ${isPrimary ? '' : ''}`}>
          {label}
        </span>
        <span className={`text-xs leading-snug ${isPrimary ? 'text-amber-800' : 'text-blue-200'}`}>
          {description}
        </span>
      </span>
      <span className="ml-auto opacity-60 text-sm" aria-hidden="true">›</span>
    </Link>
  )
}
