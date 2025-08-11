import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSass } from '@rsbuild/plugin-sass'
import { pluginSvgr } from '@rsbuild/plugin-svgr'

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginSass(),
    pluginSvgr({
      svgrOptions: {
        exportType: 'named',
      },
    }),
  ],

  html: {
    template: './public/index.html',
    mountId: 'root',
    outputStructure: 'flat',
  },

  output: {
    distPath: {
      root: 'dist',
      js: 'assets/js',
      css: 'assets/css',
      media: 'assets/media',
      html: '',
    },
    cleanDistPath: true,
    assetPrefix: '/',
    cssModules: {
      localIdentName: '[name]__[local]--[hash:base64:5]',
    },
  },

  resolve: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@contexts': './src/contexts',
      '@hooks': './src/hooks',
      '@pages': './src/pages',
      '@api': './src/api',
      '@styles': './src/shared/styles',
      '@utils': './src/utils',
      '@mocks': './src/mocks',
      '@assets': './src/assets',
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx'], // Supported file extensions
  },

  dev: {
    hmr: true, // Enables Hot Module Replacement (HMR)
    client: {
      overlay: true, // Displays errors in the browser
    },
  },

  server: {
    port: 3000, // Runs dev server on port 3000
    open: true, // Auto-opens browser
    base: '/', // Base path
    historyApiFallback: true, // Enable Single Page Applications (SPA)
  },

  performance: {
    removeConsole: true, // Removes console logs in production
  },

  tools: {
    htmlPlugin: {
      title: 'EntreLibros Frontend',
    },
  },
})
