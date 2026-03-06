const express = require('express');
const router = express.Router();
const {
    createOrUpdateProfile,
    getMyProfile,
    getProfileByUserId,
    getAllProfiles,
    addPortfolioProject,
    deletePortfolioProject,
} = require('../controllers/businessController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.get('/profiles', getAllProfiles);
router.get('/profile/:userId', getProfileByUserId);
router.post('/profile', protect, authorizeRoles('business'), createOrUpdateProfile);
router.get('/profile/me/data', protect, authorizeRoles('business'), getMyProfile);
router.post('/profile/project', protect, authorizeRoles('business'), addPortfolioProject);
router.delete('/profile/project/:projectId', protect, authorizeRoles('business'), deletePortfolioProject);

module.exports = router;
