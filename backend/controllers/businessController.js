const BusinessProfile = require('../models/BusinessProfile');

// @desc    Create or update business profile
// @route   POST /api/business/profile
exports.createOrUpdateProfile = async (req, res) => {
    try {
        const { companyName, description, industry, logo, portfolioProjects } = req.body;

        let profile = await BusinessProfile.findOne({ userId: req.user._id });

        if (profile) {
            profile.companyName = companyName || profile.companyName;
            profile.description = description || profile.description;
            profile.industry = industry || profile.industry;
            profile.logo = logo !== undefined ? logo : profile.logo;
            if (portfolioProjects) profile.portfolioProjects = portfolioProjects;
            await profile.save();
        } else {
            profile = await BusinessProfile.create({
                userId: req.user._id,
                companyName,
                description,
                industry,
                logo: logo || '',
                portfolioProjects: portfolioProjects || [],
            });
        }

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my business profile
// @route   GET /api/business/profile/me
exports.getMyProfile = async (req, res) => {
    try {
        const profile = await BusinessProfile.findOne({ userId: req.user._id }).populate(
            'userId',
            'name email'
        );

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get business profile by user ID (public)
// @route   GET /api/business/profile/:userId
exports.getProfileByUserId = async (req, res) => {
    try {
        const profile = await BusinessProfile.findOne({
            userId: req.params.userId,
        }).populate('userId', 'name email');

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all business profiles
// @route   GET /api/business/profiles
exports.getAllProfiles = async (req, res) => {
    try {
        const { industry, minRating, page, limit } = req.query;
        const filter = {};

        if (industry) filter.industry = new RegExp(industry, 'i');
        if (minRating) filter.averageRating = { $gte: Number(minRating) };

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 20;
        const startIndex = (pageNum - 1) * limitNum;

        const profiles = await BusinessProfile.find(filter)
            .populate('userId', 'name email')
            .skip(startIndex)
            .limit(limitNum);

        res.json(profiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add portfolio project
// @route   POST /api/business/profile/project
exports.addPortfolioProject = async (req, res) => {
    try {
        const { title, description, imageUrl } = req.body;

        const profile = await BusinessProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found. Create one first.' });
        }

        profile.portfolioProjects.push({ title, description, imageUrl: imageUrl || '' });
        await profile.save();

        res.status(201).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete portfolio project
// @route   DELETE /api/business/profile/project/:projectId
exports.deletePortfolioProject = async (req, res) => {
    try {
        const profile = await BusinessProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        profile.portfolioProjects = profile.portfolioProjects.filter(
            (p) => p._id.toString() !== req.params.projectId
        );
        await profile.save();

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
