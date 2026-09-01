/**
 * 演習サイドパネル電卓の式評価器
 *
 * eval / new Function を一切使わず、四則演算と括弧だけを扱う再帰下降パーサで評価する。
 * 午前Ⅱの重み付け計算（例: 3*4+2*2+5*3-(2*8+4*3)）を 1 行で計算できるよう、
 * 演算子の優先順位と括弧に対応する。
 */

export type CalcResult =
  | { ok: true; value: number }
  | { ok: false; error: string }

type Token =
  | { type: 'num'; value: number }
  | { type: 'op'; value: '+' | '-' | '*' | '/' | '(' | ')' }

class CalcError extends Error {}

/** 電卓入力として許可する文字（正規化後） */
const ALLOWED_PATTERN = /[0-9.+\-*/() ]/

/**
 * 全角文字・記号を半角の演算子へ正規化する。
 * 日本語 IME 入力（＋１２３、×、÷、（）など）をそのまま受け付けるため。
 */
export function normalizeExpression(input: string): string {
  let out = ''
  for (const ch of input) {
    const code = ch.codePointAt(0) ?? 0
    // 全角英数字 → 半角
    if (code >= 0xff10 && code <= 0xff19) {
      out += String.fromCharCode(code - 0xfee0)
      continue
    }
    switch (ch) {
      case '×': case '＊': case '・': out += '*'; break
      case '÷': case '／': out += '/'; break
      case '－': case '−': case '–': case '—': case 'ー': out += '-'; break
      case '＋': out += '+'; break
      case '（': out += '('; break
      case '）': out += ')'; break
      case '．': case '。': out += '.'; break
      case '，': case ',': break  // 桁区切りは読み飛ばす
      case '　': out += ' '; break
      default: out += ch
    }
  }
  return out
}

/** 電卓の入力欄に受け付ける文字だけを残す（正規化込み） */
export function sanitizeExpressionInput(input: string): string {
  return [...normalizeExpression(input)].filter((ch) => ALLOWED_PATTERN.test(ch)).join('')
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (ch === ' ') {
      i++
      continue
    }
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      let j = i
      let dots = 0
      while (j < src.length && ((src[j] >= '0' && src[j] <= '9') || src[j] === '.')) {
        if (src[j] === '.') dots++
        j++
      }
      const raw = src.slice(i, j)
      const value = Number(raw)
      if (dots > 1 || !Number.isFinite(value)) {
        throw new CalcError(`数値の書き方が正しくありません: ${raw}`)
      }
      tokens.push({ type: 'num', value })
      i = j
      continue
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '(' || ch === ')') {
      tokens.push({ type: 'op', value: ch })
      i++
      continue
    }
    throw new CalcError(`使えない文字です: ${ch}`)
  }
  return tokens
}

class Parser {
  private pos = 0
  private readonly tokens: Token[]

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(): number {
    const value = this.parseAddSub()
    if (this.pos < this.tokens.length) {
      throw new CalcError('式が正しくありません')
    }
    return value
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos]
  }

  /** expr := term (('+' | '-') term)* */
  private parseAddSub(): number {
    let acc = this.parseMulDiv()
    for (;;) {
      const t = this.peek()
      if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
        this.pos++
        const rhs = this.parseMulDiv()
        acc = t.value === '+' ? acc + rhs : acc - rhs
        continue
      }
      return acc
    }
  }

  /**
   * term := unary (('*' | '/') unary)*
   * 2(3+4) や (1+2)3 のような暗黙の乗算も許容する。
   */
  private parseMulDiv(): number {
    let acc = this.parseUnary()
    for (;;) {
      const t = this.peek()
      if (t?.type === 'op' && (t.value === '*' || t.value === '/')) {
        this.pos++
        const rhs = this.parseUnary()
        if (t.value === '/') {
          if (rhs === 0) throw new CalcError('0 では割れません')
          acc = acc / rhs
        } else {
          acc = acc * rhs
        }
        continue
      }
      if (t?.type === 'num' || (t?.type === 'op' && t.value === '(')) {
        acc = acc * this.parseUnary()
        continue
      }
      return acc
    }
  }

  /** unary := ('+' | '-')* primary */
  private parseUnary(): number {
    const t = this.peek()
    if (t?.type === 'op' && (t.value === '+' || t.value === '-')) {
      this.pos++
      const value = this.parseUnary()
      return t.value === '-' ? -value : value
    }
    return this.parsePrimary()
  }

  /** primary := number | '(' expr ')' */
  private parsePrimary(): number {
    const t = this.peek()
    if (!t) throw new CalcError('式が途中で終わっています')
    if (t.type === 'num') {
      this.pos++
      return t.value
    }
    if (t.value === '(') {
      this.pos++
      const value = this.parseAddSub()
      const close = this.peek()
      if (!(close?.type === 'op' && close.value === ')')) {
        throw new CalcError('括弧が閉じていません')
      }
      this.pos++
      return value
    }
    throw new CalcError('式が正しくありません')
  }
}

/** 式を評価する。失敗しても例外は投げず、日本語のエラーメッセージを返す。 */
export function evaluateExpression(input: string): CalcResult {
  const src = normalizeExpression(input).trim()
  if (src === '') return { ok: false, error: '式が空です' }
  try {
    const value = new Parser(tokenize(src)).parse()
    if (!Number.isFinite(value)) return { ok: false, error: '計算できませんでした' }
    return { ok: true, value }
  } catch (e) {
    return { ok: false, error: e instanceof CalcError ? e.message : '計算できませんでした' }
  }
}

/** 浮動小数の誤差（0.1+0.2 → 0.30000000000000004）を丸めて表示用文字列にする。 */
export function formatCalcNumber(value: number): string {
  if (!Number.isFinite(value)) return '—'
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return String(value)
  return String(Number(value.toPrecision(12)))
}
