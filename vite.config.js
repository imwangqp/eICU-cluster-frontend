import { defineConfig } from 'vite'
import svgLoader from "vite-svg-loader";
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
      svgLoader()
  ],
  server: {
    //用来配置跨域
    host: '127.0.0.1',
    port: 8000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',//目标服务器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
