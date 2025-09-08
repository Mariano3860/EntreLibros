import { beforeEach, afterEach, describe, expect, it } from 'vitest'
import { pool, setTestClient } from '../db.js'
import { createBook, listBooks } from './bookRepository.js'
import type { PoolClient } from 'pg'

let client: PoolClient

beforeEach(async () => {
  client = await pool.connect()
  await client.query('BEGIN')
  setTestClient(client)
})

afterEach(async () => {
  await client.query('ROLLBACK')
  client.release()
  setTestClient(null)
})

describe('bookRepository', () => {
  it('inserts and lists books', async () => {
    await createBook('Test Book')
    const books = await listBooks()
    expect(books).toHaveLength(1)
    expect(books[0].title).toBe('Test Book')
  })
})
