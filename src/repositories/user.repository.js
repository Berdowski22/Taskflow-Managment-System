const pool = require('../database/pool');

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
    const result = await pool.query(
        `UPDATE users SET
            full_name = COALESCE($1, full_name),
            email = COALESCE($2, email),
            department = COALESCE($3, department)
         WHERE id = $4 RETURNING id`,
        [fullName ?? null, email ?? null, department ?? null, id]
    );
    return result.rows[0] ? getUserById(id) : null;
};

// Kullanıcıya atanmış görevlerin assignee_id değeri ON DELETE SET NULL ile boşalır
const deleteUserId = async (id) => {
    const user = await getUserById(id);
    if (!user) return null;

    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    return user;
};

module.exports = { createUser, getUserById, getAllUsers, updateUser, deleteUserId };