/**
 * 問題データ インデックス
 *
 * 問題を追加する方法：
 * 1. 該当カテゴリのファイル（例: stakeholder.ts）を開く
 * 2. 配列の末尾に Question オブジェクトを追記する
 * 3. id は重複しないユニーク値を付与する（例: 'pm-st-051'）
 *
 * 新カテゴリを追加する方法：
 * 1. このディレクトリに <categoryId>.ts を新規作成する
 * 2. `export const xxxQuestions: Question[] = [...]` を定義する
 * 3. 下記の import と questions 配列への展開を追加する
 * 4. src/data/categories.ts のカテゴリ ID と一致させる
 *
 * NW 22カテゴリの問題ファイル（layer1-3, dns, dhcp 等）は F2-P2 で全置換予定のため
 * ディスクには残置しているが、questions 配列には spread しない。
 * これにより Home / Settings / Quiz の総問題数が PM カテゴリ実数を反映する。
 */

import type { Question } from '../../types'

// PM カテゴリ（PMBOK第7版＋IPA PM試験シラバスベース）
// F1.5-P3 stakeholder パイロット投入。F2-P2 で team / development-approach / planning を追加。残 8 カテゴリは F2-P2 継続。
import { stakeholderQuestions } from './stakeholder'
import { teamQuestions } from './team'
import { developmentApproachQuestions } from './development-approach'
import { planningQuestions } from './planning'

export type { Question }

export const questions: Question[] = [
  ...stakeholderQuestions,
  ...teamQuestions,
  ...developmentApproachQuestions,
  ...planningQuestions,
]
