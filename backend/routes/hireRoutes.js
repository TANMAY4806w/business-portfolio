const express = require('express');
const router = express.Router();
const {
    createHireRequest,
    updateHireStatus,
    getMyHireRequests,
    getHireRequest,
    downloadSOW,
    downloadInvoice
} = require('../controllers/hireController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createHireRequest);
router.put('/:id', protect, updateHireStatus);
router.get('/', protect, getMyHireRequests);
router.get('/:id', protect, getHireRequest);
router.get('/:id/sow', protect, downloadSOW);
router.get('/:id/invoice', protect, downloadInvoice);

module.exports = router;
