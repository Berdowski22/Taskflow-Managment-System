const pool = require('../database/pool');
const { withAssignmentTransaction } = require('../database/assignment-transaction');
const taskRepository = require('./task.repository');

// Aktif görevler (pending / in-progress) tasks tablosundan alt sorguyla hesaplanır
const USER_SELECT = `
    u.id,
    u.full_name AS "fullName",
    u.email,
    u.department,
    (SELECT COUNT(*)::int FROM tasks t
      WHERE t.assignee_id = u.id AND t.status IN ('pending', 'in-progress')) AS "activeTaskCount",
    COALESCE((SELECT JSON_AGG(
        JSON_BUILD_OBJECT('id', t.id, 'title', t.title, 'status', t.status, 'priority', t.priority)
        ORDER BY t.id)
      FROM tasks t
      WHERE t.assignee_id = u.id AND t.status IN ('pending', 'in-progress')), '[]'::json) AS "activeTasks"
`;

const createUser = async ({ fullName, email, department }) => {
    const result = await pool.query(
        `INSERT INTO users (full_name, email, department) VALUES ($1, $2, $3) RETURNING id`,
        [fullName, email, department]
    );
    return getUserById(result.rows[0].id);
};

const getUserById = async (id) => {
    const result = await pool.query(
        `SELECT ${USER_SELECT}         FROM users u WHERE u.id = $1`,
        [id]
    );
    return result.rows[0] || null;
};

const getAllUsers = async () => {
    const result = await pool.query(
        `SELECT ${USER_SELECT} FROM users u ORDER BY u.id`
    );
    return result.rows;
};

const updateUser = async (id, { fullName, email, department }) => {
    const updated = await withAssignmentTransaction(async (client) => {
        const result = await client.query(
            `UPDATE users SET
            full_name = COALESCE($1, full_name),
            email = COALESCE($2, email),
            department = COALESCE($3, department)
         WHERE id = $4 RETURNING id`,
            [fullName ?? null, email ?? null, department ?? null, id]
        );
        if (!result.rows[0]) return false;
        if (department !== undefined) {
            await client.query(
                `UPDATE tasks SET assignee_id = NULL, updated_at = CURRENT_TIMESTAMP
             WHERE assignee_id = $1 AND title IS DISTINCT FROM $2`,
                [id, department]
            );
        }
        return true;
    });
    return updated ? getUserById(id) : null;
};

// Kullanıcıya atanmış görevlerin assignee_id değeri ON DELETE SET NULL ile boşalır
const deleteUserId = async (id) => {
    const user = await getUserById(id);
    if (!user) return null;

    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    return user;
};


const assignTaskToUser = async (taskId, userId) => {
    const task = await taskRepository.update(taskId, { assigneeId: userId });
    return task ? task.id : null;
};

module.exports = { createUser, getUserById, getAllUsers, updateUser, deleteUserId, assignTaskToUser };