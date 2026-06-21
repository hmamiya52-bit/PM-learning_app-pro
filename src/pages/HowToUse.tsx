import { Link } from 'react-router-dom'

interface ScreenshotGuide {
  title: string
  image: string
  alt: string
  points: string[]
  variant?: 'wide' | 'phone'
}

const SCREENSHOT_GUIDES: ScreenshotGuide[] = [
  {
    title: 'トップページ',
    image: '/how-to-use/home-desktop.png',
    alt: 'トップページの学習メニューとカテゴリ一覧',
    points: [
      'カテゴリ一覧から分野別の問題演習を開始します。',
      '学習メニューから、ノート・午前Ⅱ／午後Ⅰ／午後Ⅱ演習・応用情報マネジメントへ移動できます。',
      '学習履歴で最近の取り組みを確認できます。',
    ],
  },
  {
    title: 'ノートモード',
    image: '/how-to-use/note-detail-mobile.png',
    alt: 'ノートモードで赤字を隠している画面',
    variant: 'phone',
    points: [
      '分野別の重要知識を、実際のノート画面で確認します。',
      '赤字を隠すと、重要キーワードを伏せた暗記テストとして使えます。',
      'チェックボックスで理解度を記録できます。',
    ],
  },
  {
    title: '問題演習中の画面',
    image: '/how-to-use/quiz-question-mobile.png',
    alt: 'スマホ版の問題演習画面',
    variant: 'phone',
    points: [
      'スマホでも片手で選択肢を押しやすい配置です。',
      '解答後に正誤と解説を確認します。',
      '正解や継続学習は経験値と勲章に反映されます。',
    ],
  },
  {
    title: '午後問題演習補助',
    image: '/how-to-use/afternoon-desktop.png',
    alt: '午後問題演習補助の問題一覧',
    points: [
      '年度、問、テーマ、最高点、実施日を一覧で確認します。',
      '行を選ぶと、点数記録や解答欄モードへ進めます。',
      '午後問題は点数の推移を見ながら周回します。',
    ],
  },
  {
    title: '午後問題の解答欄モード',
    image: '/how-to-use/afternoon-answer-mode.png',
    alt: '午後問題の解答欄モードで答え合わせしている画面',
    points: [
      '解答欄に自分の答えを入力し、すぐに答え合わせできます。',
      '○、△、×で自己採点すると、推定スコアが表示されます。',
      'トラッカーに記録すると、点数と保存した解答を後から確認できます。',
    ],
  },
  {
    title: 'PC・スマホ同期',
    image: '/how-to-use/sync-desktop.png',
    alt: 'PC・スマホ同期の端末選択画面',
    points: [
      'PC版アプリとスマホ版アプリの学習状況を統合します。',
      '最初に操作している端末を選ぶと、必要な手順だけが表示されます。',
      'QRコードが使えない場合は、同期文字列で同じ操作を行えます。',
    ],
  },
]

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7.5 4.5L12.5 10L7.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M12.5 4.5L7.5 10L12.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ScreenshotSection({ guide, index }: { guide: ScreenshotGuide; index: number }) {
  const figureClass = [
    'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm',
    guide.variant === 'phone' ? 'mx-auto max-w-sm' : '',
  ].filter(Boolean).join(' ')

  return (
    <section className="border-t border-slate-200 py-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)] lg:items-start">
        <figure className={figureClass}>
          <img
            src={guide.image}
            alt={guide.alt}
            loading="lazy"
            className="block w-full bg-slate-100"
          />
        </figure>
        <div>
          <p className="text-[11px] font-black tracking-wide text-brand-dark">PAGE {index + 1}</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">{guide.title}</h2>
          <ul className="mt-4 space-y-3">
            {guide.points.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-relaxed text-slate-700">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-dark" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default function HowToUse() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7">
          <div className="max-w-3xl">
            <p className="text-xs font-black tracking-wide text-brand-dark">GUIDE</p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
              アプリの使い方
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              このアプリは、プロジェクトマネージャ試験の知識整理、問題演習、午後問題の記録・計画を一元的に行うための学習アプリです。ここでは、各機能の画面と使い方について説明します。ご自身の学習状況に合わせて各機能を使い分けてください。
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white px-5 shadow-sm sm:px-7">
          {SCREENSHOT_GUIDES.map((guide, index) => (
            <ScreenshotSection key={guide.title} guide={guide} index={index} />
          ))}
        </div>

        <section className="mt-6 rounded-lg border border-brand-light bg-brand-light px-5 py-5">
          <h2 className="text-base font-black text-slate-900">迷ったときの使い分け</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-slate-900">知識があいまい</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">ノートモードで用語と流れを確認します。</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">用語を覚えたい</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">4択から始め、慣れたら記述モードで確認します。</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">午後問題を伸ばしたい</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">解答欄モードで書き、点数記録で周回状況を残します。</p>
            </div>
          </div>
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800"
          >
            <BackIcon />
            ホームへ戻る
          </Link>
          <Link
            to="/sync"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:border-brand-light hover:text-brand-darker"
          >
            PC・スマホ同期へ
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </div>
  )
}
