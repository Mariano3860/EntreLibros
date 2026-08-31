import express from 'express';
import { randomUUID } from 'node:crypto';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import booksRouter from './routes/books.js';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import mapRouter from './routes/map.js';
import communityRouter from './routes/community.js';
import contactRouter from './routes/contact.js';
import messagesRouter from './routes/messages.js';
import agreementsRouter from './routes/agreements.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { csrfProtection, getFrontendUrl } from './security.js';
import notificationsRouter from './routes/notifications.js';
import { registerNotificationEvents } from './services/notifications.js';

const app = express();
registerNotificationEvents();

app.use(helmet());
app.use((req, res, next) => {
  const requestId = randomUUID();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});
const frontendUrl = getFrontendUrl();
app.use(
  cors({
    origin: (origin, callback) =>
      callback(null, !origin || origin === frontendUrl),
    credentials: true,
  })
);
app.use((req, res, next) => csrfProtection(frontendUrl, req, res, next));
app.use(
  express.json({
    limit: process.env.API_JSON_LIMIT || '10mb',
  })
);
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms request=:req[x-request-id]'
  )
);

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
app.use('/api/messages', messagesRouter);
app.use('/api/agreements', agreementsRouter);
app.use('/api/notifications', notificationsRouter);

export default app;
