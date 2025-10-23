import React from 'react'
import ReactDOM from 'react-dom/client'

import '@src/assets/i18n/i18n'

import App from './App'
import { enableMocking } from './setupMocks'

enableMocking().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root')!)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
