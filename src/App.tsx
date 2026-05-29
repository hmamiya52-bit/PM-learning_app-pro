import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AppliedRefresh from './pages/AppliedRefresh'
import Quiz from './pages/Quiz'
import OfficialMorningQuiz from './pages/OfficialMorningQuiz'          // F1-P4 で追加
import OfficialMorningSession from './pages/OfficialMorningSession'    // F1-P4 で追加
import OfficialMorningSummary from './pages/OfficialMorningSummary'    // F1-P4 で追加
import AfternoonProblems from './pages/AfternoonProblems'
import AfternoonAnswerDetail from './pages/AfternoonAnswerDetail'
import AfternoonMyAnswer from './pages/AfternoonMyAnswer'
import AfternoonExplanationDetail from './pages/AfternoonExplanationDetail'   // F2-P8 詳細解説
import EssayList from './pages/EssayList'                                 // F1-P5 で追加
import EssayTraining from './pages/EssayTraining'                         // F1-P5 で追加
import EssayAttemptDetail from './pages/EssayAttemptDetail'               // F1-P5 で追加
import Notes from './pages/Notes'
import NoteDetail from './pages/NoteDetail'
import Search from './pages/Search'
import Settings from './pages/Settings'
import ImportantMarks from './pages/ImportantMarks'                       // F1-P2 で追加
import Badges from './pages/Badges'
import HowToUse from './pages/HowToUse'
import ActivityHistory from './pages/ActivityHistory'
import DeviceSync from './pages/DeviceSync'
import NotFound from './pages/NotFound'

/**
 * 開発版 App.tsx（フェーズ1）
 *
 * 設計書 §4.1 に準拠。開発期間中は AuthGuard / Login を使用しない。
 * 未実装画面（公式午前Ⅱ / 論述 / 重要マーク管理）は import/Route ともコメントアウト。
 * F1-P2 → F1-P5 で順次有効化する。
 *
 * 正式版（v1.0.0）では §4.2 に従って AuthGuard を復活させる（F2-P6 実施）。
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 全画面 Layout 適用（演習・クイズも含む）
            F2-UX 改善: 演習中・クイズ中もサイドバーを開けるよう Layout 配下に統合。
            Layout 側で /quiz, /morning/session, /morning/summary はデフォルト最小化される。
            没入型ローカルヘッダーは sticky top-12 で Layout ヘッダーの下に配置。 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/applied-refresh" element={<AppliedRefresh />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/:categoryId" element={<NoteDetail />} />

          {/* クイズ・公式午前Ⅱ（F1-P4、F2-UX で Layout 配下に移動） */}
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/morning/session" element={<OfficialMorningSession />} />
          <Route path="/morning/summary" element={<OfficialMorningSummary />} />

          {/* 公式午前Ⅱ トップ（F1-P4） */}
          <Route path="/morning" element={<OfficialMorningQuiz />} />

          {/* 午後I（PM1のみ） */}
          <Route path="/afternoon" element={<AfternoonProblems />} />
          <Route path="/afternoon/problems" element={<Navigate to="/afternoon" replace />} />
          <Route path="/afternoon/answers/:id" element={<AfternoonAnswerDetail />} />
          <Route path="/afternoon/answers/:id/myAnswer" element={<AfternoonMyAnswer />} />
          <Route path="/afternoon/answers/:id/explanation" element={<AfternoonExplanationDetail />} />

          {/* 論述（午後II、F1-P5） */}
          <Route path="/essay" element={<EssayList />} />
          <Route path="/essay/:id" element={<EssayTraining />} />
          <Route path="/essay/:id/attempts/:attemptId" element={<EssayAttemptDetail />} />

          {/* 共通機能 */}
          <Route path="/search" element={<Search />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/history" element={<ActivityHistory />} />
          <Route path="/sync" element={<DeviceSync />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/important" element={<ImportantMarks />} />     {/* F1-P2 */}

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
