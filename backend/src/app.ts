import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import booksRouter from './routes/books.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import mapRouter from './routes/map.js';
import communityRouter from './routes/community.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const app = express();

app.use(helmet());
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());
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

// TODO(api-alignment): montar rutas para `/api/books/mine` y `/api/contact/submit`
// cuando el backend cubra las necesidades del frontend y
// dejemos de depender de mocks MSW.

export default app;
