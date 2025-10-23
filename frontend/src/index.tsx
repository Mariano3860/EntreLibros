import React from 'react'
import ReactDOM from 'react-dom/client'

import '@src/assets/i18n/i18n'
import { resolvedApiBaseUrl } from '@src/api/axios'

import App from './App'

async function enableMocking() {
  const env = process.env.NODE_ENV ?? ''
  const isMockableEnv = env === 'development' || env === 'test'
  if (!isMockableEnv) {
    return
  }

  const useMocksEnv = import.meta.env.PUBLIC_API_USE_MOCKS
  const normalizedEnv = useMocksEnv?.toString().toLowerCase().trim()
  const shouldUseMocks = ['true', '1', 'yes'].includes(normalizedEnv ?? '')
  const hasExplicitDisable = ['false', '0', 'no'].includes(normalizedEnv ?? '')
  const hasAbsoluteBase = /^https?:\/\//.test(resolvedApiBaseUrl ?? '')

  if (!shouldUseMocks && (hasExplicitDisable || hasAbsoluteBase)) {
    return
  }
  const { worker } = await import('@mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
