const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.patch('/:id', userController.patchUser);
router.delete('/:id', userController.deleteUser);
router.post('/:taskId/assign/:userId', userController.assignTaskToUser);


module.exports = router;

