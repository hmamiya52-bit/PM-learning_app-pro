import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AuthGuard from './auth/AuthGuard'

// 初期表示に必要な画面は即時読み込み（ログイン直後・ホームで待たせないため）
import Login from './pages/Login'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// 以降は遅延読み込み。Suspense 境界は Layout の <Outlet /> 側に置いている。
// 単一ルートでしか使わない大きなデータ（午後Ⅰ詳細解説・論述参考答案・SM系など）を
// 初期バンドルから外すのが狙い。
const AppliedRefresh = lazy(() => import('./pages/AppliedRefresh'))
const Quiz = lazy(() => import('./pages/Quiz'))
const OfficialMorningQuiz = lazy(() => import('./pages/OfficialMorningQuiz'))          // F1-P4 で追加
const OfficialMorningSession = lazy(() => import('./pages/OfficialMorningSession'))    // F1-P4 で追加
const OfficialMorningSummary = lazy(() => import('./pages/OfficialMorningSummary'))    // F1-P4 で追加
const AfternoonProblems = lazy(() => import('./pages/AfternoonProblems'))
const AfternoonAnswerDetail = lazy(() => import('./pages/AfternoonAnswerDetail'))
const AfternoonMyAnswer = lazy(() => import('./pages/AfternoonMyAnswer'))
const AfternoonExplanationDetail = lazy(() => import('./pages/AfternoonExplanationDetail'))   // F2-P8 詳細解説
const EssayList = lazy(() => import('./pages/EssayList'))                                 // F1-P5 で追加
const EssayGuide = lazy(() => import('./pages/EssayGuide'))                               // 論述のコツ ガイド
const EssayOutline = lazy(() => import('./pages/EssayOutline'))                           // 骨子練習モード
const EssayTraining = lazy(() => import('./pages/EssayTraining'))                         // F1-P5 で追加
const EssayAttemptDetail = lazy(() => import('./pages/EssayAttemptDetail'))               // F1-P5 で追加
const EssaySampleAnswerView = lazy(() => import('./pages/EssaySampleAnswerView'))         // F2-P9 参考答案
const Notes = lazy(() => import('./pages/Notes'))
const NoteDetail = lazy(() => import('./pages/NoteDetail'))
const AfternoonTips = lazy(() => import('./pages/AfternoonTips'))                         // 午後Ⅰ定石一覧
const Search = lazy(() => import('./pages/Search'))
const Settings = lazy(() => import('./pages/Settings'))
const ImportantMarks = lazy(() => import('./pages/ImportantMarks'))                       // F1-P2 で追加
const Badges = lazy(() => import('./pages/Badges'))
const HowToUse = lazy(() => import('./pages/HowToUse'))
const ActivityHistory = lazy(() => import('./pages/ActivityHistory'))
const DeviceSync = lazy(() => import('./pages/DeviceSync'))
const ItServiceManager = lazy(() => import('./pages/ItServiceManager'))
const SmStrategy = lazy(() => import('./pages/sm/SmStrategy'))
const SmCases = lazy(() => import('./pages/sm/SmCases'))
const SmThemes = lazy(() => import('./pages/sm/SmThemes'))
const SmKnowledge = lazy(() => import('./pages/sm/SmKnowledge'))
const SmMorning = lazy(() => import('./pages/sm/SmMorning'))
const SmAfternoon = lazy(() => import('./pages/sm/SmAfternoon'))
const SmEssay = lazy(() => import('./pages/sm/SmEssay'))
const SmHistory = lazy(() => import('./pages/sm/SmHistory'))
const SmReport = lazy(() => import('./pages/sm/SmReport'))
const SmPlan = lazy(() => import('./pages/sm/SmPlan'))
const SmFinalSprint = lazy(() => import('./pages/sm/SmFinalSprint'))
const SmReview = lazy(() => import('./pages/sm/SmReview'))
const SmAnswerParts = lazy(() => import('./pages/sm/SmAnswerParts'))
const SmSimulation = lazy(() => import('./pages/sm/SmSimulation'))
const SmPrescriptions = lazy(() => import('./pages/sm/SmPrescriptions'))

/**
 * App.tsx（正式版 v1.0.0）
 *
 * 設計書 §7.2 に従い AuthGuard を復活：
 *   - /login は AuthGuard の外側に配置（フルスクリーン・Layout 非適用）
 *   - Layout 配下の全画面を <AuthGuard> でラップ（未認証は /login へリダイレクト）
 *
 * 2026-07-21: ルート単位のコード分割を導入（M1）。
 *   Login / Home / NotFound 以外を React.lazy 化し、Suspense 境界は Layout に置く。
 *   PWA のプリキャッシュ設定は変更していないため、オフライン利用性は従来どおり。
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ログイン（AuthGuard の外側・正式版 v1.0.0 で復活。設計§7.2） */}
        <Route path="/login" element={<Login />} />

        {/* 全画面 Layout 適用（演習・クイズも含む）。正式版は AuthGuard で保護。
            F2-UX 改善: 演習中・クイズ中もサイドバーを開けるよう Layout 配下に統合。
            Layout 側で /quiz, /morning/session, /morning/summary はデフォルト最小化される。
            没入型ローカルヘッダーは sticky top-12 で Layout ヘッダーの下に配置。 */}
        <Route element={<AuthGuard><Layout /></AuthGuard>}>
          <Route path="/" element={<Home />} />
          <Route path="/applied-refresh" element={<AppliedRefresh />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/notes" element={<Notes />} />
          {/* 午後Ⅰ定石一覧（静的セグメントのため :categoryId より先に配置） */}
          <Route path="/notes/afternoon-tips" element={<AfternoonTips />} />
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
          <Route path="/essay/guide" element={<EssayGuide />} />
          <Route path="/essay/:id" element={<EssayTraining />} />
          <Route path="/essay/:id/outline" element={<EssayOutline />} />
          <Route path="/essay/:id/sample" element={<EssaySampleAnswerView />} />
          <Route path="/essay/:id/attempts/:attemptId" element={<EssayAttemptDetail />} />

          {/* ITサービスマネージャ */}
          <Route path="/it-service-manager" element={<ItServiceManager />} />
          <Route path="/it-service-manager/strategy" element={<SmStrategy />} />
          <Route path="/it-service-manager/cases" element={<SmCases />} />
          <Route path="/it-service-manager/plan" element={<SmPlan />} />
          <Route path="/it-service-manager/themes" element={<SmThemes />} />
          <Route path="/it-service-manager/knowledge" element={<SmKnowledge />} />
          <Route path="/it-service-manager/morning" element={<SmMorning />} />
          <Route path="/it-service-manager/afternoon" element={<SmAfternoon />} />
          <Route path="/it-service-manager/essay" element={<SmEssay />} />
          <Route path="/it-service-manager/history" element={<SmHistory />} />
          <Route path="/it-service-manager/report" element={<SmReport />} />
          <Route path="/it-service-manager/final" element={<SmFinalSprint />} />
          <Route path="/it-service-manager/review" element={<SmReview />} />
          <Route path="/it-service-manager/answer-parts" element={<SmAnswerParts />} />
          <Route path="/it-service-manager/simulation" element={<SmSimulation />} />
          <Route path="/it-service-manager/prescriptions" element={<SmPrescriptions />} />

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
