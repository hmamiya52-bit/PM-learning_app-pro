interface Props {
  xpGained: number
  isCorrect: boolean
}

export default function XpGain({ xpGained, isCorrect }: Props) {
  if (!isCorrect || xpGained <= 0) return null
  return (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      +{xpGained} XP
    </span>
  )
}
