import { reactRouter } from '@react-router/dev/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  base: process.env.BASE_URL || './',

  resolve:
    process.env.NODE_ENV === 'development'
      ? {}
      : {
          alias: {
            'react-dom/server': 'react-dom/server.node',
          },
        },
})
