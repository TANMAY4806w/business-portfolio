const express = require('express');
const router = express.Router();
const {
    createHireRequest,
    updateHireStatus,
    getMyHireRequests,
    getHireRequest,
} = require('../controllers/hireController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createHireRequest);
router.put('/:id', protect, updateHireStatus);
router.get('/', protect, getMyHireRequests);
router.get('/:id', protect, getHireRequest);

module.exports = router;
