import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import booksRouter from './routes/books.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import mapRouter from './routes/map.js';
import communityRouter from './routes/community.js';
import contactRouter from './routes/contact.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();

app.use(helmet());
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(
  express.json({
    limit: process.env.API_JSON_LIMIT || '10mb',
  })
);
app.use(morgan('dev'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/books', booksRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/map', mapRouter);
app.use('/api/community', communityRouter);
app.use('/api/contact', contactRouter);

// TODO(api-alignment): mount routes for `/api/books/mine` and `/api/community/*`
// when the backend covers the needs of the frontend and we stop depending on
// MSW mocks.

export default app;
