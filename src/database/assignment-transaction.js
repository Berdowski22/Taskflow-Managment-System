const pool = require('./pool');
const JOB_GROUPS = require('../models/job-groups');

// Serialize assignment and department changes across application instances.
const withAssignmentTransaction = async (operation) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [1952543595]);
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const validateAssignment = async (client, title, assigneeId) => {
  if (assigneeId === null) return;
  if (!JOB_GROUPS.includes(title)) {
    const error = new Error(`Task title must be one of: ${JOB_GROUPS.join(', ')}`);
    error.status = 400;
    throw error;
  }
  const result = await client.query('SELECT department FROM users WHERE id = $1', [assigneeId]);
  if (!result.rows[0]) {
    const error = new Error('assigneeId must refer to an existing user');
    error.status = 400;
    throw error;
  }
  if (result.rows[0].department !== title) {
    const error = new Error('Task title must match the user department');
    error.status = 400;
    throw error;
  }
};

module.exports = { withAssignmentTransaction, validateAssignment };
