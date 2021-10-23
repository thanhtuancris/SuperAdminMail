const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin.controller');
const middleware = require('../middleware/admin.middleware')

router.post('/ad/login',middleware.login ,adminController.login);
router.post('/ad/logout', adminController.logout);
router.post('/ad/change-password',middleware.changePassword ,adminController.changePassword);
router.post('/ad/get-all-user',middleware.getAllUser, adminController.getAllUser);
router.post('/ad/add-user',middleware.addUser, adminController.addUser);
router.post('/ad/edit-user',middleware.editUser, adminController.editUser);
router.post('/ad/delete-user',middleware.deleteUser, adminController.deleteUser);

module.exports = router;