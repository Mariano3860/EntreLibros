import { Router } from 'express';
import { createBook, listBooks } from '../repositories/bookRepository.js';

const router = Router();

/**
 * @openapi
 * /api/books:
 *   get:
 *     summary: List all books
 *     tags:
 *       - Books
 *     responses:
 *       200:
 *         description: Array of books
 */
router.get('/', async (_req, res) => {
  const books = await listBooks();
  res.json(books);
});

/**
 * @openapi
 * /api/books:
 *   post:
 *     summary: Create a book
 *     tags:
 *       - Books
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Book created
 *       400:
 *         description: title is required
 */
router.post('/', async (req, res) => {
  const { title } = req.body as { title?: string };
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  const book = await createBook(title);
  res.status(201).json(book);
});

export default router;
