/**
 * 問題データ インデックス
 *
 * 問題を追加する方法：
 * 1. 該当カテゴリのファイル（例: routing.ts）を開く
 * 2. 配列の末尾に Question オブジェクトを追記する
 * 3. id は重複しないユニーク値を付与する（例: 'q-019b'）
 *
 * 新カテゴリを追加する方法：
 * 1. このディレクトリに <categoryId>.ts を新規作成する
 * 2. `export const xxxQuestions: Question[] = [...]` を定義する
 * 3. 下記の import と questions 配列への展開を追加する
 * 4. src/data/categories.ts にもカテゴリを追加する
 */

import type { Question } from '../../types'

import { layer1_3Questions } from './layer1-3'
import { routingQuestions } from './routing'
import { dnsQuestions } from './dns'
import { dhcpQuestions } from './dhcp'
import { httpQuestions } from './http'
import { mailQuestions } from './mail'
import { sslTlsQuestions } from './ssl-tls'
import { ipsecQuestions } from './ipsec'
import { firewallQuestions } from './firewall'
import { idsIpsQuestions } from './ids-ips'
import { wirelessQuestions } from './wireless'
import { tcpIpQuestions } from './tcp-ip'
import { voipQuestions } from './voip'
import { wanQuestions } from './wan'
import { monitoringQuestions } from './monitoring'
import { securityAttackQuestions } from './security-attack'
import { ldapAuthQuestions } from './ldap-auth'
import { ipv6Questions } from './ipv6'
import { iotQuestions } from './iot'
import { vrrpQuestions } from './vrrp'
import { securityQuestions } from './security'
import { loadBalancerQuestions } from './load-balancer'
import { sdnQuestions } from './sdn'
import { proxyQuestions } from './proxy'

// PM カテゴリ（F1.5-P3 stakeholder パイロット投入。残 11 カテゴリは F2-P2 で追加）
import { stakeholderQuestions } from './stakeholder'

export type { Question }

export const questions: Question[] = [
  // PM カテゴリ（PMBOK第7版＋IPA PM試験シラバスベース）
  ...stakeholderQuestions,
  // NW 残置（F2-P2 で PM 12カテゴリへ全置換予定）
  ...layer1_3Questions,
  ...routingQuestions,
  ...dnsQuestions,
  ...dhcpQuestions,
  ...httpQuestions,
  ...tcpIpQuestions,
  ...mailQuestions,
  ...sslTlsQuestions,
  ...ipsecQuestions,
  ...firewallQuestions,
  ...idsIpsQuestions,
  ...wirelessQuestions,
  ...vrrpQuestions,
  ...voipQuestions,
  ...wanQuestions,
  ...monitoringQuestions,
  ...securityAttackQuestions,
  ...ldapAuthQuestions,
  ...ipv6Questions,
  ...iotQuestions,
  ...securityQuestions,
  ...loadBalancerQuestions,
  ...sdnQuestions,
  ...proxyQuestions,
]
