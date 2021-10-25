const express = require('express');
const router = express.Router();
const logController = require('../controller/logMail.controller');
const middleware = require('../middleware/logMail.middleware')

router.post('/log/get-log-import',middleware.getLogImport,logController.getLogImport);
router.post('/log/get-log-export',middleware.getLogImport,logController.getLogExport);
router.post('/log/delete-log',middleware.deleteLog,logController.deleteLog);

module.exports = router;