// Logger middleware: her isteği konsola ve logs/requests.log dosyasına yazar.
// Format: [2026-10-16T12:00:00.000Z] GET /tasks 200 - 4ms

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'requests.log');

// logs/ klasörü yoksa oluştur (.gitignore'da olduğu için repoda bulunmaz)
fs.mkdirSync(LOG_DIR, { recursive: true });

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const start = process.hrtime.bigint();

  // Yanıt gönderildiğinde durum kodu ve süre belli olur
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const line = `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${Math.round(durationMs)}ms`;

    console.log(line);
    fs.appendFile(LOG_FILE, line + '\n', (err) => {
      if (err) console.error('Logger could not write to file:', err.message);
    });
  });

  next();
};

module.exports = logger;
