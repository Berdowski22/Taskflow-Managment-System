const pool = require('../database/pool');
const { withAssignmentTransaction, validateAssignment } = require('../database/assignment-transaction');

// t: tasks (veya INSERT/UPDATE/DELETE ... RETURNING sonucu), u: atanan kullanıcı
const TASK_SELECT = `
  t.id,
  t.title,
  t.description,
  t.status,
  t.priority,
  t.assignee_id AS "assigneeId",
  u.full_name AS assignee,
  t.created_at AS "createdAt",
  t.updated_at AS "updatedAt"
`;

const USER_JOIN = 'LEFT JOIN users u ON u.id = t.assignee_id';

const findAll = async ({ status, priority, assignee, assigneeId, keyword }) => {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`t.status = $${values.length}`);
  }

  if (priority) {
    values.push(priority);
    conditions.push(`t.priority = $${values.length}`);
  }

  if (assigneeId) {
    values.push(assigneeId);
    conditions.push(`t.assignee_id = $${values.length}`);
  }

  if (assignee) {
    values.push(assignee);
    conditions.push(`LOWER(u.full_name) = LOWER($${values.length})`);
  }

  if (keyword) {
    values.push(keyword);
    conditions.push(
      `(POSITION(LOWER($${values.length}) IN LOWER(t.title)) > 0
        OR POSITION(LOWER($${values.length}) IN LOWER(t.description)) > 0)`
    );
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT ${TASK_SELECT} FROM tasks t ${USER_JOIN} ${whereClause} ORDER BY t.id`,
    values
  );

  return result.rows;
};

const findById = async (id) => {
  const result = await pool.query(
    `SELECT ${TASK_SELECT} FROM tasks t ${USER_JOIN} WHERE t.id = $1`,
    [id]
  );

  return result.rows[0] || null;
};

const create = async ({ title, description, status, priority, assigneeId }) => {
  return withAssignmentTransaction(async (client) => {
    await validateAssignment(client, title, assigneeId);
    const result = await client.query(
      `WITH t AS (
       INSERT INTO tasks (title, description, status, priority, assignee_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *
     )
     SELECT ${TASK_SELECT} FROM t ${USER_JOIN}`,
      [title, description, status, priority, assigneeId]
    );

    return result.rows[0];
  });
};

const update = async (id, fields) => {
  const columnNames = {
    title: 'title',
    description: 'description',
    status: 'status',
    priority: 'priority',
    assigneeId: 'assignee_id',
  };
  const values = [];
  const assignments = Object.entries(fields).map(([field, value]) => {
    values.push(value);
    return `${columnNames[field]} = $${values.length}`;
  });

  values.push(id);
  return withAssignmentTransaction(async (client) => {
    const existing = await client.query('SELECT title, assignee_id FROM tasks WHERE id = $1', [id]);
    if (!existing.rows[0]) return null;
    const title = fields.title === undefined ? existing.rows[0].title : fields.title;
    const assigneeId = fields.assigneeId === undefined ? existing.rows[0].assignee_id : fields.assigneeId;
    if (fields.title !== undefined || fields.assigneeId !== undefined) {
      await validateAssignment(client, title, assigneeId);
    }
    const result = await client.query(
      `WITH t AS (
       UPDATE tasks
       SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length}
       RETURNING *
     )
     SELECT ${TASK_SELECT} FROM t ${USER_JOIN}`,
      values
    );

    return result.rows[0] || null;
  });
};

const remove = async (id) => {
  const result = await pool.query(
    `WITH t AS (
       DELETE FROM tasks WHERE id = $1 RETURNING *
     )
     SELECT ${TASK_SELECT} FROM t ${USER_JOIN}`,
    [id]
  );

  return result.rows[0] || null;
};

module.exports = { findAll, findById, create, update, remove };
