// Görev Yönetim Controller'ı (CRUD Operasyonları)
const taskRepository = require('../repositories/task.repository');
const {
  DEFAULTS,
  ALLOWED_FIELDS,
  STATUSES,
  PRIORITIES,
  validateTask,
} = require('../models/task.model');

// Yardımcı Fonksiyon: Sadece izinli alanları filtrele
const pickAllowedFields = (data) => {
  const result = {};
  for (const field of ALLOWED_FIELDS) {
    if (data[field] !== undefined) {
      result[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
    }
  }
  return result;
};

// Yardımcı Fonksiyon: :id parametresini doğrula
const parseId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

// 1. GET /tasks - Tüm görevleri listele
const getAllTasks = async (req, res) => {
  const filters = req.query;
  const allowedFilters = ['status', 'priority', 'assignee', 'keyword'];
  const errors = Object.keys(filters)
    .filter((filter) => !allowedFilters.includes(filter))
    .map((filter) => `Unsupported filter: ${filter}`);

  for (const filter of allowedFilters) {
    if (filters[filter] !== undefined && (typeof filters[filter] !== 'string' || !filters[filter].trim())) {
      errors.push(`${filter} must be a non-empty string`);
    }
  }

  if (filters.status && !STATUSES.includes(filters.status)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);
  }

  if (filters.priority && !PRIORITIES.includes(filters.priority)) {
    errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Invalid filters', errors });
  }

  const filteredTasks = await taskRepository.findAll({
    status: filters.status,
    priority: filters.priority,
    assignee: filters.assignee?.trim(),
    keyword: filters.keyword?.trim(),
  });

  res.status(200).json({
    success: true,
    count: filteredTasks.length,
    data: filteredTasks,
  });
};

// 2. GET /tasks/:id - Tekil görev detayı
const getTaskById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(404).json({ success: false, message: `Task with id ${req.params.id} not found` });
  }

  const task = await taskRepository.findById(id);

  if (!task) {
    return res.status(404).json({ success: false, message: `Task with id ${id} not found` });
  }

  res.status(200).json({ success: true, data: task });
};

// 3. POST /tasks - Yeni görev ekle
const createTask = async (req, res) => {
  const errors = validateTask(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const fields = pickAllowedFields(req.body);
  const newTask = await taskRepository.create({
    ...DEFAULTS,
    ...fields,
  });

  res.status(201).json({ success: true, data: newTask });
};

// 4. PATCH /tasks/:id - Görev güncelle
const updateTask = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(404).json({ success: false, message: `Task with id ${req.params.id} not found` });
  }

  const errors = validateTask(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  const updatedTask = await taskRepository.update(id, pickAllowedFields(req.body));
  if (!updatedTask) {
    return res.status(404).json({ success: false, message: `Task with id ${id} not found` });
  }
  res.status(200).json({ success: true, data: updatedTask });
};

// 5. DELETE /tasks/:id - Görev sil
const deleteTask = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(404).json({ success: false, message: `Task with id ${req.params.id} not found` });
  }

  const deletedTask = await taskRepository.remove(id);
  if (!deletedTask) {
    return res.status(404).json({ success: false, message: `Task with id ${id} not found` });
  }

  res.status(200).json({
    success: true,
    message: `Task with id ${id} deleted`,
    data: deletedTask,
  });
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
