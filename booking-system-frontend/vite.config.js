import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 路径别名配置
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    }
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true, // 自动打开浏览器
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  // 构建优化配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 启用/禁用 CSS 代码拆分
    cssCodeSplit: true,
    // 启用/禁用 gzip 压缩大小报告
    reportCompressedSize: false,
    // chunk 大小警告的限制（以 kbs 为单位）
    chunkSizeWarningLimit: 1000,
    
    // Rollup 打包配置
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          // 将 React 相关库打包成单独的 chunk
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // 将 Redux 相关库打包成单独的 chunk
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          // 将 Ant Design 打包成单独的 chunk
          'antd-vendor': ['antd'],
          // 将工具库打包成单独的 chunk
          'utils-vendor': ['axios', 'dayjs'],
        },
        // 用于从入口点创建的块的打包输出格式
        entryFileNames: 'js/[name]-[hash].js',
        // 用于命名代码拆分时创建的共享块的输出命名
        chunkFileNames: 'js/[name]-[hash].js',
        // 用于输出静态资源的命名
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true,
      }
    }
  },
  
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'antd',
      'axios',
      'dayjs',
    ]
  }
})

