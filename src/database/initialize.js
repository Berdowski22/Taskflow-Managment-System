const pool = require('./pool');

const initializeDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Set it in your environment or .env file.');
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      full_name  TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await pool.query(`
   CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in-progress', 'completed')),
      priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
      assignee TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};
module.exports = initializeDatabase;
