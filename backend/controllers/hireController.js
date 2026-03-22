const HireRequest = require('../models/HireRequest');
const Service = require('../models/Service');

// @desc    Create hire request
// @route   POST /api/hire
exports.createHireRequest = async (req, res) => {
    try {
        const { serviceId } = req.body;

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Prevent hiring own service
        if (service.businessId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You cannot hire your own service' });
        }

        // Check if a pending/active hire request already exists
        const existing = await HireRequest.findOne({
            clientId: req.user._id,
            serviceId,
            status: { $in: ['pending', 'accepted'] },
        });

        if (existing) {
            return res
                .status(400)
                .json({ message: 'You already have an active hire request for this service' });
        }

        const hireRequest = await HireRequest.create({
            clientId: req.user._id,
            businessId: service.businessId,
            serviceId,
        });

        const populated = await hireRequest.populate([
            { path: 'serviceId', select: 'title price' },
            { path: 'clientId', select: 'name email' },
            { path: 'businessId', select: 'name email' },
        ]);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update hire request status
// @route   PUT /api/hire/:id
exports.updateHireStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['accepted', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const hireRequest = await HireRequest.findById(req.params.id);

        if (!hireRequest) {
            return res.status(404).json({ message: 'Hire request not found' });
        }

        // Only the business owner can update status
        if (hireRequest.businessId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        hireRequest.status = status;
        await hireRequest.save();

        const populated = await hireRequest.populate([
            { path: 'serviceId', select: 'title price' },
            { path: 'clientId', select: 'name email' },
            { path: 'businessId', select: 'name email' },
        ]);

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my hire requests (client or business)
// @route   GET /api/hire
exports.getMyHireRequests = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'client') {
            filter.clientId = req.user._id;
        } else {
            filter.businessId = req.user._id;
        }

        const hireRequests = await HireRequest.find(filter)
            .populate('serviceId', 'title price deliveryTime')
            .populate('clientId', 'name email')
            .populate('businessId', 'name email')
            .sort({ createdAt: -1 });

        res.json(hireRequests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single hire request
// @route   GET /api/hire/:id
exports.getHireRequest = async (req, res) => {
    try {
        const hireRequest = await HireRequest.findById(req.params.id)
            .populate('serviceId', 'title price deliveryTime')
            .populate('clientId', 'name email')
            .populate('businessId', 'name email');

        if (!hireRequest) {
            return res.status(404).json({ message: 'Hire request not found' });
        }

        // Only the client or business involved can view
        const userId = req.user._id.toString();
        if (
            hireRequest.clientId._id.toString() !== userId &&
            hireRequest.businessId._id.toString() !== userId
        ) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(hireRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
