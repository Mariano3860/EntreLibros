import { describe, expect, test } from 'vitest'

describe('index.tsx', () => {
  test('should render App in root element', async () => {
    const rootElement = document.createElement('div')
    rootElement.id = 'root'
    document.body.appendChild(rootElement)

    await import('../src/index')

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(rootElement.innerHTML).toContain('Buggies')

    document.body.removeChild(rootElement)
  })
})
