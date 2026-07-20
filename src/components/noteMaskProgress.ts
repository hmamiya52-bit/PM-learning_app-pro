// ─────────────────────────────────────────────
// 赤字マスクの開封状況を集計するためのコンテキスト
//
// RedWord が自分の状態（マスク中か／めくられたか）を通知し、Provider 側で
// セクション単位に集計する。Provider が無い場合（午後Ⅰ定石一覧など）は
// useContext が null を返し、RedWord は何も通知しない。
//
// この方式だと items / navyItems / headerDiagrams のどこに置かれた RedWord でも
// 実際に描画されたものだけが自動的に数えられるため、データ側の走査が不要になる。
// ─────────────────────────────────────────────
import { createContext } from 'react'

export interface MaskProgressApi {
  /** 自身の状態を通知する。masked=false のものは集計対象から外れる */
  report: (id: string, masked: boolean, revealed: boolean) => void
  /** アンマウント時に集計から取り除く */
  unregister: (id: string) => void
}

export const MaskProgressContext = createContext<MaskProgressApi | null>(null)
