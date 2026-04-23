const { db } = require('../config/firebase');

// @desc    Create or update business profile
// @route   POST /api/business/profile
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { companyName, description, industry, logo, portfolioProjects } = req.body;
        const profileRef = db.collection('businessProfiles').doc(req.user.uid);
        const profileDoc = await profileRef.get();

        const profileData = {
            userId: req.user.uid,
            companyName: companyName || '',
            description: description || '',
            industry: industry || '',
            logo: logo || '',
            portfolioProjects: portfolioProjects || [],
            updatedAt: new Date().toISOString()
        };

        if (profileDoc.exists) {
            // Update
            const existing = profileDoc.data();
            profileData.companyName = companyName || existing.companyName;
            profileData.description = description || existing.description;
            profileData.industry = industry || existing.industry;
            profileData.logo = logo !== undefined ? logo : existing.logo;
            if (portfolioProjects) profileData.portfolioProjects = portfolioProjects;
            
            await profileRef.update(profileData);
        } else {
            // Create
            profileData.createdAt = new Date().toISOString();
            profileData.averageRating = 0;
            profileData.totalReviews = 0;
            await profileRef.set(profileData);
        }

        res.status(200).json({ _id: req.user.uid, ...profileData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my business profile
// @route   GET /api/business/profile/me/data
exports.getMyProfile = async (req, res) => {
    try {
        const profileDoc = await db.collection('businessProfiles').doc(req.user.uid).get();

        if (!profileDoc.exists) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        
        let data = profileDoc.data();
        const userDocRef = await db.collection('users').doc(req.user.uid).get();
        const userData = userDocRef.exists ? userDocRef.data() : { name: req.user.name, email: req.user.email };
        data.userId = { _id: req.user.uid, name: userData.name, email: userData.email };
        data.stripeAccountId = userData.stripeAccountId || null;

        res.json({ _id: profileDoc.id, ...data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get business profile by user ID (public)
// @route   GET /api/business/profile/:userId
exports.getProfileByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const profileDoc = await db.collection('businessProfiles').doc(userId).get();

        if (!profileDoc.exists) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : { name: 'Unknown', email: '' };

        let data = profileDoc.data();
        data.userId = { _id: userId, name: userData.name, email: userData.email };

        res.json({ _id: profileDoc.id, ...data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all business profiles
// @route   GET /api/business/profiles
exports.getAllProfiles = async (req, res) => {
    try {
        const { industry, minRating, page, limit } = req.query;
        let query = db.collection('businessProfiles');

        if (industry) {
            query = query.where('industry', '==', industry);
        }
        if (minRating) {
            query = query.where('averageRating', '>=', Number(minRating));
        }

        const snapshot = await query.get();
        let profiles = [];
        
        for (const doc of snapshot.docs) {
            let data = doc.data();
            const userDoc = await db.collection('users').doc(data.userId).get();
            const userData = userDoc.exists ? userDoc.data() : { name: 'Unknown', email: '' };
            data.userId = { _id: data.userId, name: userData.name, email: userData.email };
            profiles.push({ _id: doc.id, ...data });
        }

        // Manual Pagination for Firestore
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
        const startIndex = (pageNum - 1) * limitNum;
        
        res.json(profiles.slice(startIndex, startIndex + limitNum));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add portfolio project
// @route   POST /api/business/profile/project
exports.addPortfolioProject = async (req, res) => {
    try {
        const { title, description, imageUrl } = req.body;
        const profileRef = db.collection('businessProfiles').doc(req.user.uid);
        const profileDoc = await profileRef.get();

        if (!profileDoc.exists) {
            return res.status(404).json({ message: 'Profile not found. Create one first.' });
        }

        let profileData = profileDoc.data();
        const newProject = {
            _id: db.collection('businessProfiles').doc().id, // Generate random id
            title,
            description,
            imageUrl: imageUrl || ''
        };
        
        profileData.portfolioProjects = profileData.portfolioProjects || [];
        profileData.portfolioProjects.push(newProject);
        
        await profileRef.update({ portfolioProjects: profileData.portfolioProjects });

        res.status(201).json({ _id: profileDoc.id, ...profileData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete portfolio project
// @route   DELETE /api/business/profile/project/:projectId
exports.deletePortfolioProject = async (req, res) => {
    try {
        const profileRef = db.collection('businessProfiles').doc(req.user.uid);
        const profileDoc = await profileRef.get();

        if (!profileDoc.exists) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        let profileData = profileDoc.data();
        profileData.portfolioProjects = profileData.portfolioProjects.filter(
            (p) => p._id !== req.params.projectId
        );
        
        await profileRef.update({ portfolioProjects: profileData.portfolioProjects });

        res.json({ _id: profileDoc.id, ...profileData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
