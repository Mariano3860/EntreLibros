import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import booksRouter from './routes/books.js';
import authRouter from './routes/auth.js';

const app = express();

app.use(helmet());
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: frontendUrl }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/books', booksRouter);
app.use('/api/auth', authRouter);

export default app;
