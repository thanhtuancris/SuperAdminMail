const express = require('express');
const router = express.Router();
const logController = require('../controller/logMail.controller');
const middleware = require('../middleware/log.middleware')

router.post('/log/get-log',middleware.getlog,logController.getlog);
router.post('/log/delete-log',middleware.deletelog,logController.deletelog);

module.exports = router;