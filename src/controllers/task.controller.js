// Görev Yönetim Controller'ı (CRUD Operasyonları)
// Tüm istekler doğrudan bu controller üzerinden tasks.json dosyası ile çalışır.

const fs = require('fs/promises');
const path = require('path');
const { DEFAULTS, ALLOWED_FIELDS, validateTask } = require('../models/task.model');

const DATA_FILE = path.join(__dirname, '..', 'data', 'tasks.json');

// Yardımcı Fonksiyon: tasks.json dosyasını oku
const readTasks = async () => {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf-8');
    return content.trim() ? JSON.parse(content) : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
};

// Yardımcı Fonksiyon: tasks.json dosyasına yaz
const writeTasks = async (tasks) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 4), 'utf-8');
};

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
  const tasks = await readTasks();
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
};

// 2. GET /tasks/:id - Tekil görev detayı
const getTaskById = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(404).json({ success: false, message: `Task with id ${req.params.id} not found` });
  }

  const tasks = await readTasks();
  const task = tasks.find((t) => t.id === id);

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

  const tasks = await readTasks();
  const now = new Date().toISOString();
  const nextId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  const fields = pickAllowedFields(req.body);

  const newTask = {
    id: nextId,
    title: fields.title,
    ...DEFAULTS,
    ...fields,
    createdAt: now,
    updatedAt: now,
  };

  tasks.push(newTask);
  await writeTasks(tasks);

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

  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Task with id ${id} not found` });
  }

  tasks[index] = {
    ...tasks[index],
    ...pickAllowedFields(req.body),
    updatedAt: new Date().toISOString(),
  };

  await writeTasks(tasks);

  res.status(200).json({ success: true, data: tasks[index] });
};

// 5. DELETE /tasks/:id - Görev sil
const deleteTask = async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(404).json({ success: false, message: `Task with id ${req.params.id} not found` });
  }

  const tasks = await readTasks();
  const index = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Task with id ${id} not found` });
  }

  const [deletedTask] = tasks.splice(index, 1);
  await writeTasks(tasks);

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
