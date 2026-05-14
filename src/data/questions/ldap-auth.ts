import type { Question } from '../../types'

export const ldapAuthQuestions: Question[] = [
  {
    id: 'q-160',
    topicId: 'security',
    questionText: 'ネットワークアクセス認証に使われる、クライアント・NAS・RADIUSサーバの3者構成プロトコルを{{blank}}という。',
    correctAnswer: 'RADIUS',
    choices: ['RADIUS', 'LDAP', 'Kerberos', 'TACACS+'],
    isImportant: true,
    explanation: 'RADIUS（Remote Authentication Dial-In User Service）はNAS（Network Access Server）がクライアントの認証情報をRADIUSサーバに転送して認証を委託するAAA（認証・認可・課金）プロトコル。',
    difficulty: 2,
  },
  {
    id: 'q-161',
    topicId: 'security',
    questionText: 'ディレクトリサービスへのアクセスに使われる、X.500をベースにしたプロトコルを{{blank}}という。',
    correctAnswer: 'LDAP（Lightweight Directory Access Protocol）',
    choices: ['LDAP（Lightweight Directory Access Protocol）', 'RADIUS', 'Kerberos', 'SAML'],
    isImportant: true,
    explanation: 'LDAPはActive DirectoryやOpenLDAPなどのディレクトリサービスにアクセスするプロトコル。TCPポート389（平文）または636（LDAPS/TLS）を使用。ユーザ情報や組織情報を木構造（DN）で管理する。',
    difficulty: 2,
  },
  {
    id: 'q-162',
    topicId: 'security',
    questionText: 'シングルサインオン（SSO）を実現するためのXMLベースのフェデレーション規格を{{blank}}という。',
    correctAnswer: 'SAML（Security Assertion Markup Language）',
    choices: ['SAML（Security Assertion Markup Language）', 'OAuth 2.0', 'OpenID Connect', 'Kerberos'],
    isImportant: false,
    explanation: 'SAMLはIdP（Identity Provider）とSP（Service Provider）間でXML形式のアサーション（認証結果）を交換するSSO規格。主にブラウザベースのエンタープライズSSOに使われる。',
    difficulty: 2,
  },
  {
    id: 'q-163',
    topicId: 'security',
    questionText: 'Kerberosプロトコルにおいてクライアントがサービスにアクセスするために取得するチケットを{{blank}}という。',
    correctAnswer: 'サービスチケット（ST）',
    choices: ['サービスチケット（ST）', 'TGT（Ticket Granting Ticket）', 'PKIトークン', 'OTPトークン'],
    isImportant: false,
    explanation: 'Kerberos の TGT・ST は X.509 のような「証明書」ではなく、KDC が発行する「チケット（暗号化された認可情報）」である。流れ：①KDC/AS に TGT を要求 ②TGT を提示して KDC/TGS にサービスチケット（ST）を要求 ③ST をサービスに提示してアクセス。パスワード自体はネットワーク上に流さない仕組み。',
    difficulty: 3,
  },
]
