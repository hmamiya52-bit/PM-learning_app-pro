// 認証情報リスト
// パスワードは SHA-256 ハッシュで保存。

export const AUTH_SESSION_DAYS = 60

export interface Credential {
  id: string
  passwordHash: string
}

export const CREDENTIALS: Credential[] = [
  // ───── 管理者 ─────
  { id: 'mamiya-admin', passwordHash: '35286d46d61a29aa462993c1cc1866c90e54ed1423fd3f28237b22bc26cb1d74' },

  // ───── 一般ユーザー（20名） ─────
  { id: 'Echo81',      passwordHash: '96d24ed1b581469d66c6418206ed3930d8be71b3ac62e096dd6505e105e4d407' },
  { id: 'Delta35',     passwordHash: 'a008b13889af2e5c7014837505b911cdbfed33794d9acda54cb86a98b9048354' },
  { id: 'Charlie60',   passwordHash: 'a85c60ab3d7823b8d7d23b918ee43add138e8648f20099fa5735e8e7a406c065' },
  { id: 'Alpha05',     passwordHash: '12af93d2169060bc2d58c18969c5e2b7ffbe36b1bb09c4d84575a42042a491b6' },
  { id: 'Echo41',      passwordHash: '516c5ec9e49584a397709e54508b823d6da5feb3258f586367a223fb9b3395c2' },
  { id: 'Foxtrot33',   passwordHash: 'cef9178b066d994d444bb42fd96c87adc1f9820d9ade9a627985e2d4fd8e218e' },
  { id: 'Echo85',      passwordHash: 'a3247a43cab11c7e942ab89c3dd93a1b68cedcb4cead7893bbef0977dc6ee410' },
  { id: 'Delta02',     passwordHash: 'ed8155aae673905246ef433a5ebbae5d5a20689ef6aea21cf1652faafe9af527' },
  { id: 'Echo83',      passwordHash: 'e6065db29e177957820ad8d9d0c4531dc2acb5b731062e9beabf5ca1d7ffd91b' },
  { id: 'Bravo62',     passwordHash: '95c7807c0b017d5d9373ee22ce06210e4e65a90618d8abc0725636841a4e397d' },
  { id: 'Bravo34',     passwordHash: '76bde19bb6f9936605cb81a80469c98028a7e4550c973e4cdf686d0c325d5fc5' },
  { id: 'Charlie34',   passwordHash: 'b95975bf74fd03ff306551fe8757c93b0a79467e0251c5b7997624dca908cd6a' },
  { id: 'Delta75',     passwordHash: '62cb464dce87020dd782c5d04adbdafecb8efd3e909047544066899d4f27dfdc' },
  { id: 'Foxtrot49',   passwordHash: 'e367e808dda23018c50377af9af857092cd846835147d57dcdc2a36999307ac6' },
  { id: 'Alpha32',     passwordHash: 'aea1db4116608643c04da47865befa3610d8759687ba73f1f926b4c756d7d1f5' },
  { id: 'Delta29',     passwordHash: '8c44929d79f4c21623364b9fca95878d1583cada4fcbb34410e7dee289d277b1' },
  { id: 'Charlie25',   passwordHash: '299d92ea3b1b501f22e82e25b987b8497e609027db8762032874a57fe8a730c2' },
  { id: 'Delta64',     passwordHash: '6f34606e4436b672577598f6d411940ecb3f1db70e60e81345a50578849cca0a' },
  { id: 'Alpha59',     passwordHash: '7c93a8e1f5a3ca616ee43089a041899738fe512bce97785c66d9f53b64d4be20' },
  { id: 'Alpha03',     passwordHash: 'c7e7d87eaecde5b7afe3a86034bc9f9fdc0ae5a1a84fc5c05a73165846a5491e' },
]
