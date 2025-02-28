import { describe, expect, test } from 'vitest'
import { createRoot } from 'react-dom/client'
import App from '../src/App'

describe('index.tsx', () => {
  test('renders the app', () => {
    // Create and append the div#root element to the document
    const rootDiv = document.createElement('div')
    rootDiv.id = 'root'
    document.body.appendChild(rootDiv)
    // Ensure the root element exists
    expect(document.getElementById('root')).not.toBeNull()
    // Create root and render the app
    const root = createRoot(rootDiv)
    root.render(<App />)
    // Ensure React renders without errors
    expect(rootDiv.innerHTML).not.toBe('')
  })
})
