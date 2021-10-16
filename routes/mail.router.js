const express = require('express');
const router = express.Router();
const mailController = require('../controller/mail.controller');
const middleware = require('../middleware/mail.middleware')

router.post('/mail/add-mail', middleware.addMails ,mailController.addMailUser);
router.post('/mail/get-mail', middleware.getMail, mailController.getMailByUser);
router.post('/mail/test', mailController.testgetMailByUser);
router.post('/mail/edit-mail',middleware.editMail, mailController.editMail);
router.post('/mail/delete-mail',middleware.deleteMail, mailController.deleteMail);
router.post('/mail/delete-mails',middleware.deleteMails, mailController.deleteMails);
router.post('/mail/check-mails',middleware.checkMails, mailController.checkMails);
router.post('/mail/get-date', mailController.getDate);
router.post('/mail/get-status', mailController.getStatus);
router.post('/mail/export-mail', mailController.exportMail);
router.post('/mail/edit-mails',middleware.editMails, mailController.editMails);
module.exports = router;