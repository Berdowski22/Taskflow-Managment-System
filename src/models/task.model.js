// Task veri modeli: izinli değerler ve varsayılanlar.

const STATUSES = ['pending', 'in-progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

const DEFAULTS = {
  description: '',
  status: 'pending',
  priority: 'medium',
  assignee: null,
};

// İstemcinin gönderebileceği alanlar (id, createdAt, updatedAt sistem tarafından yönetilir)
const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'assignee'];

/**
 * Gelen veriyi doğrular.
 * @param {object} data - İstek gövdesi
 * @param {{ partial?: boolean }} options - partial=true ise (PATCH) title zorunlu değildir
 * @returns {string[]} Hata mesajları (boşsa veri geçerlidir)
 */
const validateTask = (data, { partial = false } = {}) => {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return ['Request body must be a JSON object'];
  }

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim() === '') {
      errors.push('title is required and must be a non-empty string');
    }
  }

  if (data.description !== undefined && typeof data.description !== 'string') {
    errors.push('description must be a string');
  }

  if (data.status !== undefined && !STATUSES.includes(data.status)) {
    errors.push(`status must be one of: ${STATUSES.join(', ')}`);
  }

  if (data.priority !== undefined && !PRIORITIES.includes(data.priority)) {
    errors.push(`priority must be one of: ${PRIORITIES.join(', ')}`);
  }

  if (data.assignee !== undefined && data.assignee !== null && typeof data.assignee !== 'string') {
    errors.push('assignee must be a string or null');
  }

  if (partial && !ALLOWED_FIELDS.some((field) => data[field] !== undefined)) {
    errors.push(`At least one of these fields is required: ${ALLOWED_FIELDS.join(', ')}`);
  }

  return errors;
};

module.exports = { STATUSES, PRIORITIES, DEFAULTS, ALLOWED_FIELDS, validateTask };
