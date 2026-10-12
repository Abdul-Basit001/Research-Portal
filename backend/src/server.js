import 'dotenv/config';
import app from './app.js';
import { prisma } from './services/prisma.js';

const port = Number(process.env.PORT) || 5000;
let server;

const shutdown = (signal) => {
  console.log(`${signal} received. Closing server...`);

  const disconnect = async () => {
    try {
      await prisma.$disconnect();
      console.log('PostgreSQL connection closed.');
    } catch (error) {
      console.error('Failed to close PostgreSQL connection:', error.message);
      process.exitCode = 1;
    }
  };

  if (!server) {
    void disconnect();
    return;
  }

  server.close(async (error) => {
    if (error) {
      console.error('Failed to close HTTP server:', error.message);
      process.exitCode = 1;
    }
    await disconnect();
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

try {
  await prisma.$connect();
  console.log('PostgreSQL connection established.');

  server = app.listen(port, () => {
    console.log(`Research portal API listening at http://localhost:${port}`);
  });

  server.on('error', (error) => {
    console.error('HTTP server failed:', error.message);
    void prisma.$disconnect();
    process.exitCode = 1;
  });
} catch (error) {
  console.error('PostgreSQL connection failed:', error.message);
  await prisma.$disconnect().catch((disconnectError) => {
    console.error('Failed to close PostgreSQL connection:', disconnectError.message);
  });
  process.exitCode = 1;
}
