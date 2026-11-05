const pool = require('../database/pool');

const TASK_COLUMNS = `
  id,
  title,
  description,
  status,
  priority,
  assignee,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

const findAll = async ({ status, priority, assignee, keyword }) => {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (priority) {
    values.push(priority);
    conditions.push(`priority = $${values.length}`);
  }

  if (assignee) {
    values.push(assignee);
    conditions.push(`LOWER(assignee) = LOWER($${values.length})`);
  }

  if (keyword) {
    values.push(keyword);
    conditions.push(
      `(POSITION(LOWER($${values.length}) IN LOWER(title)) > 0
        OR POSITION(LOWER($${values.length}) IN LOWER(description)) > 0)`
    );
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT ${TASK_COLUMNS} FROM tasks ${whereClause} ORDER BY id`,
    values
  );

  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT ${TASK_COLUMNS} FROM tasks WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

const create = async ({ title, description, status, priority, assignee }) => {
  const result = await pool.query(
    `INSERT INTO tasks (title, description, status, priority, assignee)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${TASK_COLUMNS}`,
    [title, description, status, priority, assignee]
  );

  return result.rows[0];
};

const update = async (id, fields) => {
  const columnNames = {
    title: 'title',
    description: 'description',
    status: 'status',
    priority: 'priority',
    assignee: 'assignee',
  };
  const values = [];
  const assignments = Object.entries(fields).map(([field, value]) => {
    values.push(value);
    return `${columnNames[field]} = $${values.length}`;
  });

  values.push(id);
  const result = await pool.query(
    `UPDATE tasks
     SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${values.length}
     RETURNING ${TASK_COLUMNS}`,
    values
  );

  return result.rows[0] || null;
};

const remove = async (id) => {
  const result = await pool.query(
    `DELETE FROM tasks WHERE id = $1 RETURNING ${TASK_COLUMNS}`,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = { findAll, findById, create, update, remove };
