const pool = require('./pool');

const initializeDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Set it in your environment or .env file.');
  }
};

module.exports = initializeDatabase;
