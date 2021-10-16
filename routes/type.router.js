const express = require('express');
const router = express.Router();
const typeController = require('../controller/typeMail.controller');
const middleware = require('../middleware/type.middleware')

router.post('/type/add-type',middleware.addType,typeController.addType);
router.post('/type/edit-type',middleware.editType,typeController.editType);
router.post('/type/get-type',middleware.getType,typeController.getType);
router.post('/type/delete-type',middleware.deleteType,typeController.deleteType);

module.exports = router;