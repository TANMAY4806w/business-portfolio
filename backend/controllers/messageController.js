const Message = require('../models/Message');
const HireRequest = require('../models/HireRequest');

// @desc    Get chat messages for a hire request
// @route   GET /api/messages/:hireRequestId
exports.getMessages = async (req, res) => {
    try {
        const hireRequest = await HireRequest.findById(req.params.hireRequestId);

        if (!hireRequest) {
            return res.status(404).json({ message: 'Hire request not found' });
        }

        // Ensure the user is part of this hire request
        const userId = req.user._id.toString();
        if (
            hireRequest.clientId.toString() !== userId &&
            hireRequest.businessId.toString() !== userId
        ) {
            return res.status(403).json({ message: 'Not authorized to view these messages' });
        }

        const messages = await Message.find({
            hireRequestId: req.params.hireRequestId,
        })
            .populate('senderId', 'name')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
