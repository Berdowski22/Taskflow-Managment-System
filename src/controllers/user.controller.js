// Kullanıcı Yönetim Controller'ı (CRUD Operasyonları)
const userRepository = require('../repositories/user.repository');
const { ALLOWED_FIELDS, validateUser } = require('../models/user.model');

// Yardımcı Fonksiyon: Sadece izinli alanları al ve metinleri kırp
const pickAllowedFields = (data) => {
  const result = {};
  for (const field of ALLOWED_FIELDS) {
    if (data[field] !== undefined) {
      result[field] = data[field].trim();
    }
  }
  return result;
};

// Yardımcı Fonksiyon: :id parametresini doğrula
const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const notFound = (res, id) =>
  res.status(404).json({ success: false, message: `User with id ${id} not found` });

// 1. GET /users - Tüm kullanıcıları listele (aktif görev sayısı ve görevleriyle)
const getAllUsers = async (req, res) => {
  const users = await userRepository.getAllUsers();
  res.status(200).json({ success: true, count: users.length, data: users });
};

// 2. GET /users/:id - Tekil kullanıcı detayı
const getUserById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return notFound(res, req.params.id);

  const user = await userRepository.getUserById(id);
  if (!user) return notFound(res, id);

  res.status(200).json({ success: true, data: user });
};

// 3. POST /users - Yeni kullanıcı ekle
const createUser = async (req, res) => {
  const errors = validateUser(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const user = await userRepository.createUser(pickAllowedFields(req.body));
  res.status(201).json({ success: true, data: user });
};

// 4. PUT /users/:id - Kullanıcıyı güncelle (tüm alanlar gönderilmelidir)
const updateUser = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return notFound(res, req.params.id);

  const errors = validateUser(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const user = await userRepository.updateUser(id, pickAllowedFields(req.body));
  if (!user) return notFound(res, id);

  res.status(200).json({ success: true, data: user });
};

// PATCH /users/:id - Sadece gönderilen alanları güncelle
const patchUser = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return notFound(res, req.params.id);

  const errors = validateUser(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const user = await userRepository.updateUser(id, pickAllowedFields(req.body));
  if (!user) return notFound(res, id);

  res.status(200).json({ success: true, data: user });
};

// 5. DELETE /users/:id - Kullanıcıyı sil (görevleri atanmamış duruma düşer)
const deleteUser = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return notFound(res, req.params.id);

  const user = await userRepository.deleteUserId(id);
  if (!user) return notFound(res, id);

  res.status(200).json({ success: true, message: `User with id ${id} deleted`, data: user });
};
const assignTaskToUser = async (req, res) => {
  const taskId = parseId(req.params.taskId);
  const userId = parseId(req.params.userId);
  if (!taskId || !userId) return res.status(400).json({ success: false, message: 'Invalid taskId or userId' });

  const assignedTaskId = await userRepository.assignTaskToUser(taskId, userId);
  if (!assignedTaskId) return res.status(404).json({ success: false, message: `Task with id ${taskId} not found or could not be assigned` });

  res.status(200).json({ success: true, message: `Task with id ${taskId} assigned to user with id ${userId}`, data: { taskId: assignedTaskId, userId } });
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  patchUser,
  deleteUser,
  assignTaskToUser,
};
