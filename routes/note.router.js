const express = require('express');
const router = express.Router();
const noteController = require('../controller/noteMail.controller');
const middleware = require('../middleware/noteMail.middleware')

router.post('/note/add-note',middleware.addNote,noteController.addNote);
router.post('/note/get-note',middleware.getNote,noteController.getNote);
router.post('/note/delete-note',middleware.deleteNote,noteController.deleteNote);
router.post('/note/edit-note',middleware.editNote,noteController.editNote);

module.exports = router;