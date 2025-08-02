import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App'
import '@/assets/i18n/i18n'

async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }
  const { worker } = await import('../mocks/browser')
  return worker.start()
}

enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
