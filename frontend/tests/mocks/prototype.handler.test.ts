import { describe, expect, test } from 'vitest'

describe('prototype demo handler', () => {
  test('returns the same catalog and order on repeated requests', async () => {
    const first = await fetch('http://localhost/api/demo/prototype')
    const second = await fetch('http://localhost/api/demo/prototype')

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(await second.json()).toEqual(await first.json())
  })

  test('exposes explicit empty and error fixtures', async () => {
    const empty = await fetch(
      'http://localhost/api/demo/prototype?fixture=empty'
    )
    const failed = await fetch(
      'http://localhost/api/demo/prototype?fixture=error'
    )

    expect(await empty.json()).toMatchObject({ catalog: {} })
    expect(failed.status).toBe(503)
    expect(await failed.json()).toEqual({ error: 'prototype_fixture_error' })
  })
})
