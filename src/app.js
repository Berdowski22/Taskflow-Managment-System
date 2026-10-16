const express = require('express');
const taskRoutes = require('./routes/task.routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'TaskFlow API is running' });
});

// Routes
app.use('/tasks', taskRoutes);

// 404 for undefined routes (must come after all routes)
app.use(notFound);

// Central error handler (must be last)
app.use(errorHandler);

module.exports = app;
