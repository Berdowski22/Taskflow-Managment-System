// Task veri modeli: izinli değerler ve varsayılanlar.

const STATUSES = ['pending', 'in-progress', 'completed'];
const PRIORITIES = ['low', 'medium', 'high'];

const DEFAULTS = {
  description: '',
  status: 'pending',
  priority: 'medium',
  assignee: null,
};

module.exports = { STATUSES, PRIORITIES, DEFAULTS };
