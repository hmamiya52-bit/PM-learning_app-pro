import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Service Worker をビルド成果物に含める
      includeAssets: ['favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'PM Learning App',
        short_name: 'PM Learn',
        description: 'プロジェクトマネージャ試験 学習アプリ',
        lang: 'ja',
        start_url: '/',
        scope: '/',
        theme_color: '#9d5b8b',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        categories: ['education'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // ナビゲーションリクエストは index.html へフォールバック
        navigateFallback: 'index.html',
        // ハッシュ付きアセット等にはフォールバックさせない
        // （SW が index.html を JS として返してしまうと、ブラウザは HTML を JS としてパースし失敗 → ページ崩壊）
        navigateFallbackDenylist: [
          /^\/api\//,
          /\.(?:js|mjs|css|map|svg|png|jpg|jpeg|webp|gif|ico|woff2?|ttf|otf|json|webmanifest)$/i,
          /^\/assets\//,
        ],
        // 旧バージョンのプリキャッシュを削除（ハッシュ違いの古い JS/CSS を残さない）
        cleanupOutdatedCaches: true,
        // 新 SW を即座にアクティブ化し、開いているクライアントを乗っ取る
        // → デプロイ直後のリロードで確実に最新版が表示される
        skipWaiting: true,
        clientsClaim: true,
        // Service Worker のキャッシュ最大サイズを緩和
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
})
