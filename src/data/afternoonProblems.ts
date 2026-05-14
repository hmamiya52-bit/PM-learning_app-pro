export type ProblemSection = 'G1' | 'G2'

export interface AfternoonProblem {
  id: string          // e.g. 'H25-G1-1'
  year: string        // e.g. 'H25'
  yearLabel: string   // e.g. 'H25（2013）'
  era: 'heisei' | 'reiwa'
  section: ProblemSection
  number: number      // 1 / 2 / 3
  title: string
  keywords: string[]
  questionPdfUrl?: string
}

const H = (year: number) => `H${year}`
const R = (year: number) => `R${year}`
const HL = (year: number) => `H${year}（${year + 1988}年）`
const RL = (year: number) => `R${year}（${year + 2018}年）`

function p(
  year: string,
  yearLabel: string,
  era: AfternoonProblem['era'],
  section: ProblemSection,
  number: number,
  title: string,
  keywords: string[],
  questionPdfUrl?: string,
): AfternoonProblem {
  return { id: `${year}-${section}-${number}`, year, yearLabel, era, section, number, title, keywords, questionPdfUrl }
}

export const afternoonProblems: AfternoonProblem[] = [
  // ───── H25 (2013) ─────────────────────────────────────────────────
  p(H(25), HL(25), 'heisei', 'G1', 1, 'リモート接続ネットワークの検討',    ['VPN'],                                             'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p900000027za-att/2013h25a_nw_pm1_qs.pdf'),
  p(H(25), HL(25), 'heisei', 'G1', 2, '端末の管理強化',                    ['認証・SSO'],                                       'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p900000027za-att/2013h25a_nw_pm1_qs.pdf'),
  p(H(25), HL(25), 'heisei', 'G1', 3, 'ネットワークの再構築',              ['スイッチング'],                                    'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p900000027za-att/2013h25a_nw_pm1_qs.pdf'),
  p(H(25), HL(25), 'heisei', 'G2', 1, '無線LANの導入',                     ['無線LAN', '認証・SSO'],                            'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p900000027za-att/2013h25a_nw_pm2_qs.pdf'),
  p(H(25), HL(25), 'heisei', 'G2', 2, '開発システムの再構築',              ['SDN・自動化'],                                     'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p900000027za-att/2013h25a_nw_pm2_qs.pdf'),

  // ───── H26 (2014) ─────────────────────────────────────────────────
  p(H(26), HL(26), 'heisei', 'G1', 1, 'ネットワーク構成の見直し',          ['ルーティング', '冗長化'],                          'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000ye5-att/2014h26a_nw_pm1_qs.pdf'),
  p(H(26), HL(26), 'heisei', 'G1', 2, 'ファイアウォールの障害対応',        ['セキュリティ', '冗長化', 'NAT・IPv6移行'],          'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000ye5-att/2014h26a_nw_pm1_qs.pdf'),
  p(H(26), HL(26), 'heisei', 'G1', 3, 'ネットワークのセキュリティ対策',    ['セキュリティ', '認証・SSO'],                       'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000ye5-att/2014h26a_nw_pm1_qs.pdf'),
  p(H(26), HL(26), 'heisei', 'G2', 1, '標的型メール攻撃への対策',          ['メールセキュリティ'],                              'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000ye5-att/2014h26a_nw_pm2_qs.pdf'),
  p(H(26), HL(26), 'heisei', 'G2', 2, 'IPテレフォニーシステムの導入',      ['VoIP・IP電話', 'QoS'],                             'https://www.ipa.go.jp/shiken/mondai-kaiotu/ug65p90000000ye5-att/2014h26a_nw_pm2_qs.pdf'),

  // ───── H27 (2015) ─────────────────────────────────────────────────
  p(H(27), HL(27), 'heisei', 'G1', 1, 'シングルサインオンの導入',          ['認証・SSO'],                                       'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gxj0-att/2015h27a_nw_pm1_qs.pdf'),
  p(H(27), HL(27), 'heisei', 'G1', 2, 'ファイアウォールの負荷分散',        ['セキュリティ', '冗長化', 'HTTP・CDN'],              'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gxj0-att/2015h27a_nw_pm1_qs.pdf'),
  p(H(27), HL(27), 'heisei', 'G1', 3, '侵入検知・防御システムの導入',      ['セキュリティ'],                                    'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gxj0-att/2015h27a_nw_pm1_qs.pdf'),
  p(H(27), HL(27), 'heisei', 'G2', 1, 'NAT444を用いたISPサービス',         ['NAT・IPv6移行'],                                   'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gxj0-att/2015h27a_nw_pm2_qs.pdf'),
  p(H(27), HL(27), 'heisei', 'G2', 2, '無線LANセキュリティの強化',         ['無線LAN', '認証・SSO', 'マルチキャスト'],          'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000gxj0-att/2015h27a_nw_pm2_qs.pdf'),

  // ───── H28 (2016) ─────────────────────────────────────────────────
  p(H(28), HL(28), 'heisei', 'G1', 1, 'IP電話システムの再構築',            ['VoIP・IP電話'],                                    'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_nw_pm1_qs.pdf'),
  p(H(28), HL(28), 'heisei', 'G1', 2, 'インターネット接続の見直し',        ['ルーティング', '冗長化'],                          'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_nw_pm1_qs.pdf'),
  p(H(28), HL(28), 'heisei', 'G1', 3, 'ネットワーク運用管理',              ['運用管理・監視'],                                  'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_nw_pm1_qs.pdf'),
  p(H(28), HL(28), 'heisei', 'G2', 1, '企業ネットワークの拡張',            ['ルーティング', '冗長化', 'VPN'],                   'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_nw_pm2_qs.pdf'),
  p(H(28), HL(28), 'heisei', 'G2', 2, 'データセンタのネットワーク設計',    ['VPN', 'スイッチング'],                             'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000g6fw-att/2016h28a_nw_pm2_qs.pdf'),

  // ───── H29 (2017) ─────────────────────────────────────────────────
  p(H(29), HL(29), 'heisei', 'G1', 1, 'SSL-VPNの導入',                     ['VPN', '認証・SSO'],                                'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_nw_pm1_qs.pdf'),
  p(H(29), HL(29), 'heisei', 'G1', 2, '仮想デスクトップ基盤の導入',        ['仮想化'],                                          'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_nw_pm1_qs.pdf'),
  p(H(29), HL(29), 'heisei', 'G1', 3, '社内ネットワークとクラウドとの接続', ['ルーティング', 'WAN', 'クラウド'],                 'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_nw_pm1_qs.pdf'),
  p(H(29), HL(29), 'heisei', 'G2', 1, 'SDNとクラウドの活用',               ['SDN・自動化', 'クラウド', 'HTTP・CDN'],             'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_nw_pm2_qs.pdf'),
  p(H(29), HL(29), 'heisei', 'G2', 2, '無線LANシステムの導入',              ['無線LAN', '認証・SSO'],                            'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000fqpm-att/2017h29a_nw_pm2_qs.pdf'),

  // ───── H30 (2018) ─────────────────────────────────────────────────
  p(H(30), HL(30), 'heisei', 'G1', 1, 'SaaSの導入',                        ['SDN・自動化', 'クラウド'],                         'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_nw_pm1_qs.pdf'),
  p(H(30), HL(30), 'heisei', 'G1', 2, 'ネットワーク監視の改善',            ['運用管理・監視'],                                  'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_nw_pm1_qs.pdf'),
  p(H(30), HL(30), 'heisei', 'G1', 3, '企業内ネットワーク再構築',          ['ルーティング', 'WAN'],                             'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_nw_pm1_qs.pdf'),
  p(H(30), HL(30), 'heisei', 'G2', 1, 'ネットワークシステムの設計',        ['IoT', '認証・SSO'],                                'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_nw_pm2_qs.pdf'),
  p(H(30), HL(30), 'heisei', 'G2', 2, 'サービス基盤の構築',                ['SDN・自動化', 'クラウド', '仮想化'],               'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000f01f-att/2018h30a_nw_pm2_qs.pdf'),

  // ───── R1 (2019) ──────────────────────────────────────────────────
  p(R(1),  RL(1),  'reiwa',  'G1', 1, 'ネットワークの増強',                ['ルーティング', '冗長化'],                          'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_nw_pm1_qs.pdf'),
  p(R(1),  RL(1),  'reiwa',  'G1', 2, 'Webシステムの構成変更',             ['セキュリティ', 'DNS', 'DHCP', 'HTTP・CDN'],        'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_nw_pm1_qs.pdf'),
  p(R(1),  RL(1),  'reiwa',  'G1', 3, 'LANのセキュリティ対策',             ['認証・SSO', '無線LAN', 'セキュリティ'],            'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_nw_pm1_qs.pdf'),
  p(R(1),  RL(1),  'reiwa',  'G2', 1, 'クラウドサービスへの移行',          ['VoIP・IP電話', 'クラウド'],                        'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_nw_pm2_qs.pdf'),
  p(R(1),  RL(1),  'reiwa',  'G2', 2, 'ネットワークのセキュリティ対策',    ['DNS', 'HTTP・CDN', 'セキュリティ'],                'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000dict-att/2019r01a_nw_pm2_qs.pdf'),

  // ───── R3 (2021) ──────────────────────────────────────────────────
  p(R(3),  RL(3),  'reiwa',  'G1', 1, 'ネットワーク運用管理の自動化',      ['運用管理・監視', 'SDN・自動化'],                   'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d5ru-att/2021r03h_nw_pm1_qs.pdf'),
  p(R(3),  RL(3),  'reiwa',  'G1', 2, '企業ネットワークの統合',            ['ルーティング'],                                    'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d5ru-att/2021r03h_nw_pm1_qs.pdf'),
  p(R(3),  RL(3),  'reiwa',  'G1', 3, '通信品質の確保',                    ['QoS', 'VoIP・IP電話'],                             'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d5ru-att/2021r03h_nw_pm1_qs.pdf'),
  p(R(3),  RL(3),  'reiwa',  'G2', 1, '社内システムの更改',                ['スイッチング', '冗長化', 'ルーティング'],           'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d5ru-att/2021r03h_nw_pm2_qs.pdf'),
  p(R(3),  RL(3),  'reiwa',  'G2', 2, 'インターネット接続環境の更改',      ['ルーティング', '冗長化', 'DNS'],                   'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt8000000d5ru-att/2021r03h_nw_pm2_qs.pdf'),

  // ───── R4 (2022) ──────────────────────────────────────────────────
  p(R(4),  RL(4),  'reiwa',  'G1', 1, 'ネットワークの更改',                ['VPN'],                                             'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000009sgk-att/2022r04h_nw_pm1_qs.pdf'),
  p(R(4),  RL(4),  'reiwa',  'G1', 2, 'セキュアゲートウェイサービスの導入', ['ゼロトラスト・SWG'],                              'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000009sgk-att/2022r04h_nw_pm1_qs.pdf'),
  p(R(4),  RL(4),  'reiwa',  'G1', 3, 'シングルサインオンの導入',          ['認証・SSO'],                                       'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000009sgk-att/2022r04h_nw_pm1_qs.pdf'),
  p(R(4),  RL(4),  'reiwa',  'G2', 1, 'テレワーク環境の導入',              ['仮想化', 'VPN', '冗長化'],                         'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000009sgk-att/2022r04h_nw_pm2_qs.pdf'),
  p(R(4),  RL(4),  'reiwa',  'G2', 2, '仮想化技術の導入',                  ['仮想化'],                                          'https://www.ipa.go.jp/shiken/mondai-kaiotu/gmcbt80000009sgk-att/2022r04h_nw_pm2_qs.pdf'),

  // ───── R5 (2023) ──────────────────────────────────────────────────
  p(R(5),  RL(5),  'reiwa',  'G1', 1, 'Webシステムの更改',                 ['HTTP・CDN', '認証・SSO'],                          'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05h_nw_pm1_qs.pdf'),
  p(R(5),  RL(5),  'reiwa',  'G1', 2, 'IPマルチキャストによる映像配信の導入', ['マルチキャスト'],                               'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05h_nw_pm1_qs.pdf'),
  p(R(5),  RL(5),  'reiwa',  'G1', 3, '高速無線LANの導入',                 ['無線LAN'],                                         'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05h_nw_pm1_qs.pdf'),
  p(R(5),  RL(5),  'reiwa',  'G2', 1, 'マルチクラウド利用による可用性の向上', ['DNS', 'HTTP・CDN', '冗長化', 'クラウド'],        'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05h_nw_pm2_qs.pdf'),
  p(R(5),  RL(5),  'reiwa',  'G2', 2, 'ECサーバの増強',                    ['認証・SSO'],                                       'https://www.ipa.go.jp/shiken/mondai-kaiotu/ps6vr70000010d6y-att/2023r05h_nw_pm2_qs.pdf'),

  // ───── R6 (2024) ──────────────────────────────────────────────────
  p(R(6),  RL(6),  'reiwa',  'G1', 1, 'コンテンツ配信ネットワーク',        ['HTTP・CDN', 'DNS'],                                'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06h_nw_pm1_qs.pdf'),
  p(R(6),  RL(6),  'reiwa',  'G1', 2, 'SD-WANによる拠点接続',              ['WAN', 'VPN'],                                      'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06h_nw_pm1_qs.pdf'),
  p(R(6),  RL(6),  'reiwa',  'G1', 3, 'ローカルブレイクアウトによる負荷軽減', ['無線LAN', 'ゼロトラスト・SWG', 'クラウド'],      'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06h_nw_pm1_qs.pdf'),
  p(R(6),  RL(6),  'reiwa',  'G2', 1, 'データセンターのネットワークの検討', ['SDN・自動化', 'ルーティング'],                     'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06h_nw_pm2_qs.pdf'),
  p(R(6),  RL(6),  'reiwa',  'G2', 2, '電子メールを用いた製品サポート',    ['メールセキュリティ'],                              'https://www.ipa.go.jp/shiken/mondai-kaiotu/m42obm000000afqx-att/2024r06h_nw_pm2_qs.pdf'),

  // ───── R7 (2025) ──────────────────────────────────────────────────
  p(R(7),  RL(7),  'reiwa',  'G1', 1, 'ルータの更改',                      ['ルーティング', '冗長化', 'NAT・IPv6移行'],          'https://www.ipa.go.jp/shiken/mondai-kaiotu/nl10bi0000009lh8-att/2025r07h_nw_pm1_qs.pdf'),
  p(R(7),  RL(7),  'reiwa',  'G1', 2, 'ネットワークの改善',                ['HTTP・CDN', 'QoS'],                                'https://www.ipa.go.jp/shiken/mondai-kaiotu/nl10bi0000009lh8-att/2025r07h_nw_pm1_qs.pdf'),
  p(R(7),  RL(7),  'reiwa',  'G1', 3, 'セキュアWebゲートウェイの導入',     ['ゼロトラスト・SWG'],                               'https://www.ipa.go.jp/shiken/mondai-kaiotu/nl10bi0000009lh8-att/2025r07h_nw_pm1_qs.pdf'),
  p(R(7),  RL(7),  'reiwa',  'G2', 1, '社内ネットワークのIPv6対応',        ['IPv6', 'NAT・IPv6移行', 'DHCP'],                   'https://www.ipa.go.jp/shiken/mondai-kaiotu/nl10bi0000009lh8-att/2025r07h_nw_pm2_qs.pdf'),
  p(R(7),  RL(7),  'reiwa',  'G2', 2, 'IoTシステムの設計',                 ['IoT'],                                             'https://www.ipa.go.jp/shiken/mondai-kaiotu/nl10bi0000009lh8-att/2025r07h_nw_pm2_qs.pdf'),
]

export const YEARS = [...new Set(afternoonProblems.map(p => p.year))]

export function getProblemsByYear(year: string) {
  return {
    G1: afternoonProblems.filter(p => p.year === year && p.section === 'G1').sort((a, b) => a.number - b.number),
    G2: afternoonProblems.filter(p => p.year === year && p.section === 'G2').sort((a, b) => a.number - b.number),
  }
}
