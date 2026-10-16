// Aşama 2: routing iskeleti. Gerçek CRUD mantığı Aşama 3'te eklenecek.
// Şimdilik her endpoint 501 Not Implemented döner; böylece routing'in
// doğru çalıştığı Postman ile test edilebilir.

const notImplemented = (name) => (req, res) => {
  res.status(501).json({
    success: false,
    message: `${name} is not implemented yet`,
    params: req.params,
  });
};

module.exports = {
  getAllTasks: notImplemented('getAllTasks'),
  getTaskById: notImplemented('getTaskById'),
  createTask: notImplemented('createTask'),
  updateTask: notImplemented('updateTask'),
  deleteTask: notImplemented('deleteTask'),
};
