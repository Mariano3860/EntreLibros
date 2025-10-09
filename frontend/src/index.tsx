import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import '@src/assets/i18n/i18n'
import { resolvedApiBaseUrl } from '@src/api/axios'

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const useMocksEnv = import.meta.env.PUBLIC_API_USE_MOCKS
  const shouldUseMocks =
    useMocksEnv === 'true' || useMocksEnv === '1' || useMocksEnv === 'yes'

  if (!shouldUseMocks && resolvedApiBaseUrl) {
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
