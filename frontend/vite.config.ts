import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

// 개발 서버: /api, /uploads 요청을 로컬 백엔드(8080)로 전달
export default defineConfig({
  plugins: [
    react(),
    // `import Icon from './icon.svg?react'` → React 컴포넌트로 사용
    // (`?react` 없이 import 하면 기존처럼 URL 문자열)
    svgr({
      svgrOptions: {
        plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: { overrides: { removeViewBox: false } },
            },
            // 같은 페이지에 여러 SVG가 인라인될 때 id 충돌 방지
            'prefixIds',
          ],
        },
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
      '/uploads': 'http://localhost:8080',
    },
  },
})
