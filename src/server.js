require('dotenv').config();

const app = require('./app');
const pool = require('./database/pool');
const initializeDatabase = require('./database/initialize');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initializeDatabase();
    const server = app.listen(PORT, () => {
      console.log(`TaskFlow API running on http://localhost:${PORT}`);
    });

    const shutdown = (signal) => {
      server.close(async (error) => {
        if (error) {
          console.error(`Failed to close server after ${signal}:`, error);
          process.exitCode = 1;
        }

        await pool.end();
      });
    };

    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to initialize PostgreSQL:', error);
    await pool.end();
    process.exitCode = 1;
  }
};

startServer();
