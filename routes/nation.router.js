const express = require('express');
const router = express.Router();
const nationController = require('../controller/nationMail.controller');
const middleware = require('../middleware/nation.middleware')

router.post('/nation/add-nation', nationController.addNation);
router.post('/nation/get-nation', nationController.getNation);
router.post('/nation/edit-nation', nationController.editNation);
router.post('/nation/delete-nation', nationController.deleteNation);

module.exports = router;