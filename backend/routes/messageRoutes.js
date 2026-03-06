const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/:hireRequestId', protect, getMessages);

module.exports = router;
