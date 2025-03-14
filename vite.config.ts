import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tsconfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'
import mkcert from 'vite-plugin-mkcert'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/study/BookReading/', // base: '/public/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString()
          }
        },
      },
    },
  },
  resolve: {
    alias: [
      { find: '@src', replacement: resolve(__dirname, 'src') },
      {
        find: '@components',
        replacement: resolve(__dirname, 'src/components'),
      },
    ],
  },
  server: {
    https: {
      cert: './certs/localhost.pem',
      key: './certs/localhost.pem',
    },
    host: '0.0.0.0',
    port: 3030,
    hmr: {
      clientPort: 3030,
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    mkcert({
      savePath: './certs', // save the generated certificate into certs directory
      force: true, // force generation of certs even without setting https property in the vite config
    }),
  ],
})
