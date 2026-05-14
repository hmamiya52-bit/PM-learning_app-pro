import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-700">404 Not Found</h1>
      <p className="text-slate-500 mt-2">指定されたページは存在しません。</p>
      <Link
        to="/"
        className="inline-block mt-6 px-4 py-2 bg-brand text-white rounded hover:bg-brand-dark"
      >
        ホームへ戻る
      </Link>
    </div>
  )
}
