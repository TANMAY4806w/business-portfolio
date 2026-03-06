const Service = require('../models/Service');
const BusinessProfile = require('../models/BusinessProfile');

// @desc    Create a service
// @route   POST /api/services
exports.createService = async (req, res) => {
    try {
        const { title, description, price, deliveryTime } = req.body;

        const service = await Service.create({
            businessId: req.user._id,
            title,
            description,
            price,
            deliveryTime,
        });

        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all services (with search & filter)
// @route   GET /api/services
exports.getServices = async (req, res) => {
    try {
        const { keyword, industry, minPrice, maxPrice, minRating } = req.query;
        let filter = {};

        if (keyword) {
            filter.$text = { $search: keyword };
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        let services = await Service.find(filter)
            .populate('businessId', 'name email')
            .sort({ createdAt: -1 });

        // If industry or minRating filter, we need profile data
        if (industry || minRating) {
            const profileFilter = {};
            if (industry) profileFilter.industry = new RegExp(industry, 'i');
            if (minRating) profileFilter.averageRating = { $gte: Number(minRating) };

            const profiles = await BusinessProfile.find(profileFilter).select('userId');
            const validBusinessIds = profiles.map((p) => p.userId.toString());

            services = services.filter((s) =>
                validBusinessIds.includes(s.businessId._id?.toString() || s.businessId.toString())
            );
        }

        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get services by business user ID
// @route   GET /api/services/business/:businessId
exports.getServicesByBusiness = async (req, res) => {
    try {
        const services = await Service.find({
            businessId: req.params.businessId,
        }).sort({ createdAt: -1 });

        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my services
// @route   GET /api/services/mine
exports.getMyServices = async (req, res) => {
    try {
        const services = await Service.find({ businessId: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
exports.getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate(
            'businessId',
            'name email'
        );

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.businessId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, price, deliveryTime } = req.body;
        service.title = title || service.title;
        service.description = description || service.description;
        service.price = price !== undefined ? price : service.price;
        service.deliveryTime = deliveryTime || service.deliveryTime;

        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.businessId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await service.deleteOne();
        res.json({ message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
