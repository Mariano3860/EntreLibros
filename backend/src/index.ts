import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { logger } from './utils/logger.js';

const envFile = process.env.DOTENV_CONFIG_PATH
  ? path.resolve(process.cwd(), process.env.DOTENV_CONFIG_PATH)
  : path.join(path.dirname(fileURLToPath(import.meta.url)), '../.env');
dotenv.config({ path: envFile });

import { createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from './socket.js';

const { default: app } = await import('./app.js');
const { setupWebsocket } = await import('./socket.js');

const PORT = process.env.PORT || 4000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const httpServer = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: { origin: frontendUrl, credentials: true },
});
setupWebsocket(io);

httpServer.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
