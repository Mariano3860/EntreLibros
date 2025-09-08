import { Router } from 'express'
import { createBook, listBooks } from '../repositories/bookRepository.js'

const router = Router()

router.get('/', async (_req, res) => {
  const books = await listBooks()
  res.json(books)
})

router.post('/', async (req, res) => {
  const { title } = req.body as { title?: string }
  if (!title) {
    return res.status(400).json({ error: 'title is required' })
  }
  const book = await createBook(title)
  res.status(201).json(book)
})

export default router
