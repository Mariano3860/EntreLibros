import * as dotenv from 'dotenv'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginSass } from '@rsbuild/plugin-sass'
import { pluginSvgr } from '@rsbuild/plugin-svgr'

// Load environment variables
dotenv.config()

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

  source: {
    define: {
      // ✅ Injects environment variables safely
      'process.env': JSON.stringify(process.env),
    },
  },

  output: {
    distPath: {
      root: 'dist', // ✅ Ensures correct output folder
      js: 'assets/js',
      css: 'assets/css',
      media: 'assets/media',
      html: '',
    },
    cleanDistPath: true, // ✅ Ensures old builds are removed before new build
    assetPrefix: '/', // ✅ Sets base URL for assets
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
      '@styles': './src/styles',
      '@utils': './src/utils',
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx'], // ✅ Supported file extensions
  },

  dev: {
    hmr: true, // ✅ Enables Hot Module Replacement (HMR)
    client: {
      overlay: true, // ✅ Displays errors in the browser
    },
  },

  server: {
    port: 3000, // ✅ Runs dev server on port 3000
    open: true, // ✅ Auto-opens browser
    base: '/', // Base path
    historyApiFallback: true, // Enable Single Page Applications (SPA)
  },

  performance: {
    removeConsole: true, // ✅ Removes console logs in production
  },

  tools: {
    htmlPlugin: {
      title: 'Buggies Frontend', // ✅ Sets HTML title
    },
  },
})
