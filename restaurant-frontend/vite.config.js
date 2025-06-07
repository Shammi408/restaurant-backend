import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 🔒 Optional safety check
if (process.env.NODE_ENV === 'production') {
  console.log('✅ Production build starting...');
  // Optional: fail the build if localhost is found
  // throw new Error('Remove all localhost URLs before deploying!');
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
