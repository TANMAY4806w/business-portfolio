const { db } = require('../config/firebase');

// @desc    Create a review
// @route   POST /api/reviews
exports.createReview = async (req, res) => {
    try {
        const { hireRequestId, rating, reviewText } = req.body;
        const userId = req.user.uid;

        // Validate hire request
        const hireDoc = await db.collection('hireRequests').doc(hireRequestId).get();
        if (!hireDoc.exists) {
            return res.status(404).json({ message: 'Hire request not found' });
        }
        const hireRequest = hireDoc.data();

        // Only the client can review
        if (hireRequest.clientId !== userId) {
            return res.status(403).json({ message: 'Only the client can leave a review' });
        }

        // Must be completed
        if (hireRequest.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review after hire is completed' });
        }

        // Check if already reviewed
        const existingSnap = await db.collection('reviews')
            .where('hireRequestId', '==', hireRequestId)
            .get();
            
        if (!existingSnap.empty) {
            return res.status(400).json({ message: 'You have already reviewed this hire' });
        }

        // Create review
        const reviewData = {
            businessId: hireRequest.businessId,
            clientId: userId,
            hireRequestId,
            rating: Number(rating),
            reviewText,
            createdAt: new Date().toISOString()
        };

        const newRef = db.collection('reviews').doc();
        await newRef.set(reviewData);

        // Fetch client name for response population
        const clientDoc = await db.collection('users').doc(userId).get();
        reviewData.clientId = { _id: userId, name: clientDoc.exists ? clientDoc.data().name : 'Unknown' };

        res.status(201).json({ _id: newRef.id, ...reviewData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a business
// @route   GET /api/reviews/:businessId
exports.getBusinessReviews = async (req, res) => {
    try {
        const snapshot = await db.collection('reviews')
            .where('businessId', '==', req.params.businessId)
            .get();

        let reviews = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

        // Populate clientId
        for (let i = 0; i < reviews.length; i++) {
            const clientDoc = await db.collection('users').doc(reviews[i].clientId).get();
            if (clientDoc.exists) {
                reviews[i].clientId = { _id: clientDoc.id, name: clientDoc.data().name };
            }
        }

        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
