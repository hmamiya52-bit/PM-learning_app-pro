// ─────────────────────────────────────────────
// ノート全文検索の共通ロジック
//
// 2026-07-21: /notes 一覧の検索と、グローバル検索（/search）の両方から使う。
// 実装が分かれると片方だけカバレッジが古くなるため一本化した。
// ─────────────────────────────────────────────
import { NOTE_SECTION_INDEX, type NoteSectionIndexEntry } from '../data/noteDb'

/** スニペットに含めるマッチ前後の文字数 */
export const SNIPPET_RADIUS = 20

export interface NoteSearchHit {
  entry: NoteSectionIndexEntry
  /** 見出しにマッチしたか（false なら本文のみのマッチ） */
  headingHit: boolean
  /** 本文のみマッチした場合の該当箇所スニペット。見出しマッチ時は null */
  snippet: string | null
}

/** 本文マッチ箇所の前後を切り出したスニペットを作る */
export function makeSnippet(text: string, matchIndex: number, queryLength: number): string {
  const start = Math.max(0, matchIndex - SNIPPET_RADIUS)
  const end = Math.min(text.length, matchIndex + queryLength + SNIPPET_RADIUS)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

/**
 * ノートのセクション見出し・本文を横断検索する。
 * 見出しにマッチしたものは従来どおり見出しだけを返し、
 * 本文のみマッチしたものにはスニペットを添える。
 */
export function searchNoteSections(query: string): NoteSearchHit[] {
  const trimmed = query.trim()
  if (!trimmed) return []
  const q = trimmed.toLowerCase()

  const hits: NoteSearchHit[] = []
  for (const entry of NOTE_SECTION_INDEX) {
    const headingHit = entry.heading.toLowerCase().includes(q)
    const bodyIndex = headingHit ? -1 : entry.searchText.toLowerCase().indexOf(q)
    if (!headingHit && bodyIndex === -1) continue
    hits.push({
      entry,
      headingHit,
      snippet: headingHit ? null : makeSnippet(entry.searchText, bodyIndex, trimmed.length),
    })
  }
  return hits
}

/** ノート詳細ページ内の該当箇所へのリンク先 */
export function noteHitHref(entry: NoteSectionIndexEntry): string {
  return `/notes/${entry.categoryId}#${entry.anchor}`
}
