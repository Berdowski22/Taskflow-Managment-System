// Express 5: async route'larda fırlatılan hatalar da otomatik olarak buraya gelir.
const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  // PostgreSQL unique ihlali: e-posta zaten kayıtlı
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Email is already in use',
    });
  }

  // PostgreSQL foreign key ihlali: atanan kullanıcı users tablosunda yok
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['assigneeId must refer to an existing user'],
    });
  }

  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
