// User veri modeli: izinli alanlar ve doğrulama.
const JOB_GROUPS = require('./job-groups');

const DEFAULTS = {};

// İstemcinin gönderebileceği alanlar (id, createdAt sistem tarafından yönetilir;
// aktif görev sayısı ve görev listesi tasks tablosundan hesaplanır)
const ALLOWED_FIELDS = ['fullName', 'email', 'department'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Gelen veriyi doğrular.
 * @param {object} data - İstek gövdesi
 * @param {{ partial?: boolean }} options - partial=true ise (PATCH) zorunlu alanlar aranmaz
 * @returns {string[]} Hata mesajları (boşsa veri geçerlidir)
 */
const validateUser = (data, { partial = false } = {}) => {
  const errors = [];

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return ['Request body must be a JSON object'];
  }

  if (!partial || data.fullName !== undefined) {
    if (typeof data.fullName !== 'string' || data.fullName.trim() === '') {
      errors.push('fullName is required and must be a non-empty string');
    }
  }

  if (!partial || data.email !== undefined) {
    if (typeof data.email !== 'string' || !EMAIL_PATTERN.test(data.email.trim())) {
      errors.push('email is required and must be a valid email address');
    }
  }

  if (!partial || data.department !== undefined) {
    if (typeof data.department !== 'string' || !JOB_GROUPS.includes(data.department.trim())) {
      errors.push(`department must be one of: ${JOB_GROUPS.join(', ')}`);
    }
  }

  if (partial && !ALLOWED_FIELDS.some((field) => data[field] !== undefined)) {
    errors.push(`At least one of these fields is required: ${ALLOWED_FIELDS.join(', ')}`);
  }

  return errors;
};

module.exports = { DEFAULTS, ALLOWED_FIELDS, validateUser };
