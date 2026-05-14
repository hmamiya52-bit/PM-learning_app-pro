import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllDaySummaries } from '../lib/activityLog'
import { StudyHistoryList } from '../components/history/StudyHistoryList'
import { XpChart } from '../components/history/XpChart'

export default function ActivityHistory() {
  const navigate = useNavigate()
  const daySummaries = useMemo(() => getAllDaySummaries(), [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-2xl mx-auto px-4 pb-16 pt-4 space-y-4">

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="戻る"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-black text-slate-800">学習履歴（全件）</h1>
          <span className="ml-auto text-xs text-slate-400">{daySummaries.length} 日分</span>
        </div>

        <XpChart daySummaries={daySummaries} />

        <StudyHistoryList daySummaries={daySummaries} />

      </div>
    </div>
  )
}
