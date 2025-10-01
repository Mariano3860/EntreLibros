import { Router } from 'express';
import {
  createBook,
  listBooks,
  verifyBook,
  NewBook,
} from '../repositories/bookRepository.js';
import {
  searchBooks as searchExternalBooks,
  checkBookExists,
} from '../services/openLibrary.js';

const router = Router();

// TODO(books-backlog): implementar endpoints autenticados para `/books/mine`, borradores y
// estado de oferta (venta/donación/intercambio) cuando se incorporen los campos avanzados
// del flujo de publicación del frontend. Requiere ampliar el repositorio y las migraciones
// para persistir disponibilidad, preferencias de entrega e imágenes.

router.get('/', async (_req, res) => {
  const books = await listBooks();
  res.json(books);
});

router.get('/search', async (req, res) => {
  const q = req.query.q as string | undefined;
  if (!q) {
    return res.status(400).json({
      error: 'MissingFields',
      message: 'books.errors.q_required',
    });
  }
  try {
    const books = await searchExternalBooks(q);
    res.json(books);
  } catch {
    res.status(502).json({
      error: 'SearchFailed',
      message: 'books.errors.search_failed',
    });
  }
});

router.post('/', async (req, res) => {
  const { title, author, isbn, publisher, publishedYear } = req.body as NewBook;
  if (!title) {
    return res.status(400).json({
      error: 'MissingFields',
      message: 'books.errors.title_required',
    });
  }
  const verified = await checkBookExists({
    title,
    author: author ?? undefined,
    isbn: isbn ?? undefined,
  });
  const book = await createBook({
    title,
    author,
    isbn,
    publisher,
    publishedYear,
    verified,
  });
  res.status(201).json(book);
});

router.post('/:id/verify', async (req, res) => {
  const id = Number(req.params.id);
  const book = await verifyBook(id);
  if (!book) {
    return res.status(404).json({
      error: 'NotFound',
      message: 'books.errors.not_found',
    });
  }
  res.json(book);
});

export default router;
