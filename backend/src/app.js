import cors from 'cors';
import express from 'express';
import { prisma } from './services/prisma.js';
import opportunityRoutes from './routes/opportunityRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Research portal API is running.' });
});

app.get('/api/health/db', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.use('/api/opportunities', opportunityRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, _req, res, _next) => {
  console.error('API request failed:', error.message);
  res.status(error.status || 500).json({
    message: error.status ? error.message : 'Internal server error.',
  });
});

export default app;
