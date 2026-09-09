import { describe, expect, test } from 'vitest'

describe('mock demo handler', () => {
  test('returns the same catalog and order on repeated requests', async () => {
    const first = await fetch('http://localhost/api/demo/mock')
    const second = await fetch('http://localhost/api/demo/mock')

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(await second.json()).toEqual(await first.json())
  })

  test('exposes explicit empty and error fixtures', async () => {
    const empty = await fetch('http://localhost/api/demo/mock?fixture=empty')
    const failed = await fetch('http://localhost/api/demo/mock?fixture=error')

    expect(await empty.json()).toMatchObject({ catalog: {} })
    expect(failed.status).toBe(503)
    expect(await failed.json()).toEqual({ error: 'mock_fixture_error' })
  })
})
