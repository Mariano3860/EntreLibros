import { Router } from 'express';
import {
  createBook,
  listBooks,
  searchBooks,
  verifyBook,
} from '../repositories/bookRepository.js';

const router = Router();

router.get('/', async (req, res) => {
  const { q } = req.query as { q?: string };
  const books = q ? await searchBooks(q) : await listBooks();
  res.json(books);
});

router.post('/', async (req, res) => {
  const { title, author, isbn, publishedYear, publisher } = req.body as {
    title?: string;
    author?: string;
    isbn?: string;
    publishedYear?: number;
    publisher?: string;
  };
  if (!title || !author) {
    return res.status(400).json({
      error: 'MissingFields',
      message: 'books.errors.missing_title_author',
    });
  }
  const book = await createBook({
    title,
    author,
    isbn,
    publishedYear,
    publisher,
  });
  res.status(201).json(book);
});

router.post('/:id/verify', async (req, res) => {
  const { id } = req.params;
  const book = await verifyBook(Number(id));
  if (!book) {
    return res.status(404).json({
      error: 'BookNotFound',
      message: 'books.errors.not_found',
    });
  }
  res.json(book);
});

export default router;
