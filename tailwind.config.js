/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // Tailwind の font-sans / font-mono を Meiryo UI 系に統一。
        // Windows 環境では実際に "Meiryo UI" が当たり、
        // iOS/Android では Meiryo UI に近い和文ゴシック（Hiragino Sans, 游ゴシック,
        // Noto Sans JP, Roboto 等）にフォールバックする。
        sans: [
          '"Meiryo UI"',
          '"Hiragino Sans"',
          '"Hiragino Kaku Gothic ProN"',
          '"Noto Sans JP"',
          '"Yu Gothic UI"',
          'YuGothic',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: [
          '"Meiryo UI"',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
