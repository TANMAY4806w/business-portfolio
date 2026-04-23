const { db } = require('../config/firebase');

// @desc    Get chat messages for a hire request
// @route   GET /api/messages/:hireRequestId
exports.getMessages = async (req, res) => {
    try {
        const hireRequestId = req.params.hireRequestId;
        const hireDoc = await db.collection('hireRequests').doc(hireRequestId).get();

        if (!hireDoc.exists) {
            return res.status(404).json({ message: 'Hire request not found' });
        }

        const hireRequest = hireDoc.data();
        const userId = req.user.uid;

        // Ensure the user is part of this hire request
        if (hireRequest.clientId !== userId && hireRequest.businessId !== userId) {
            return res.status(403).json({ message: 'Not authorized to view these messages' });
        }

        const snapshot = await db.collection('messages')
            .where('hireRequestId', '==', hireRequestId)
            .get();

        let messages = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

        // Populate senderId name
        for (let i = 0; i < messages.length; i++) {
            const senderDoc = await db.collection('users').doc(messages[i].senderId).get();
            if (senderDoc.exists) {
                messages[i].senderId = {
                    _id: senderDoc.id,
                    name: senderDoc.data().name
                };
            }
        }

        // Sort by createdAt ascending (oldest first for chat)
        messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
