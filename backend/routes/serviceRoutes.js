const express = require('express');
const router = express.Router();
const {
    createService,
    getServices,
    getServicesByBusiness,
    getMyServices,
    getService,
    updateService,
    deleteService,
} = require('../controllers/serviceController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/', getServices);
router.get('/mine', protect, authorizeRoles('business'), getMyServices);
router.get('/business/:businessId', getServicesByBusiness);
router.get('/:id', getService);
router.post('/', protect, authorizeRoles('business'), createService);
router.put('/:id', protect, authorizeRoles('business'), updateService);
router.delete('/:id', protect, authorizeRoles('business'), deleteService);

module.exports = router;
