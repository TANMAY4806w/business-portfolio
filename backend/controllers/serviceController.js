const { db } = require('../config/firebase');

// @desc    Create a service
// @route   POST /api/services
exports.createService = async (req, res) => {
    try {
        const { title, description, price, deliveryTime } = req.body;
        const newRef = db.collection('services').doc();

        const serviceData = {
            businessId: req.user.uid,
            title,
            description,
            price: Number(price),
            deliveryTime,
            createdAt: new Date().toISOString()
        };

        await newRef.set(serviceData);
        res.status(201).json({ _id: newRef.id, ...serviceData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all services (with search & filter)
// @route   GET /api/services
exports.getServices = async (req, res) => {
    try {
        const { keyword, industry, minPrice, maxPrice, minRating, page, limit } = req.query;
        let servicesRef = db.collection('services');
        let snapshot = await servicesRef.get();
        let services = [];

        // Manual filtering since Firestore doesn't support full-text search out of the box
        // and complex ORs on multiple fields
        snapshot.forEach((doc) => {
            services.push({ _id: doc.id, ...doc.data() });
        });

        if (keyword) {
            const kw = keyword.toLowerCase();
            services = services.filter(s => 
                (s.title && s.title.toLowerCase().includes(kw)) ||
                (s.description && s.description.toLowerCase().includes(kw))
            );
        }

        if (minPrice) services = services.filter(s => s.price >= Number(minPrice));
        if (maxPrice) services = services.filter(s => s.price <= Number(maxPrice));

        // Industry and minRating require business profile lookup
        if (industry || minRating) {
            let profileQuery = db.collection('businessProfiles');
            if (industry) profileQuery = profileQuery.where('industry', '==', industry);
            if (minRating) profileQuery = profileQuery.where('averageRating', '>=', Number(minRating));
            
            const profileSnap = await profileQuery.get();
            const validBusinessIds = profileSnap.docs.map(doc => doc.id);
            
            services = services.filter(s => validBusinessIds.includes(s.businessId));
        }

        // Populate businessId data
        for (let i = 0; i < services.length; i++) {
            const userDoc = await db.collection('users').doc(services[i].businessId).get();
            if (userDoc.exists) {
                services[i].businessId = { _id: userDoc.id, name: userDoc.data().name, email: userDoc.data().email };
            }
        }

        // Sort by createdAt desc
        services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const pageNum = parseInt(page, 10) || 1;
        const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
        const startIndex = (pageNum - 1) * limitNum;

        res.json(services.slice(startIndex, startIndex + limitNum));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get services by business user ID
// @route   GET /api/services/business/:businessId
exports.getServicesByBusiness = async (req, res) => {
    try {
        const snapshot = await db.collection('services')
            .where('businessId', '==', req.params.businessId)
            .get();
            
        let services = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my services
// @route   GET /api/services/mine
exports.getMyServices = async (req, res) => {
    try {
        const snapshot = await db.collection('services')
            .where('businessId', '==', req.user.uid)
            .get();
            
        let services = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
exports.getService = async (req, res) => {
    try {
        const doc = await db.collection('services').doc(req.params.id).get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Service not found' });
        }

        let data = { _id: doc.id, ...doc.data() };
        
        // Populate
        const userDoc = await db.collection('users').doc(data.businessId).get();
        if (userDoc.exists) {
            data.businessId = { _id: userDoc.id, name: userDoc.data().name, email: userDoc.data().email };
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update service
// @route   PUT /api/services/:id
exports.updateService = async (req, res) => {
    try {
        const ref = db.collection('services').doc(req.params.id);
        const doc = await ref.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Service not found' });
        }

        let data = doc.data();

        if (data.businessId !== req.user.uid) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { title, description, price, deliveryTime } = req.body;
        
        if (title) data.title = title;
        if (description) data.description = description;
        if (price !== undefined) data.price = Number(price);
        if (deliveryTime) data.deliveryTime = deliveryTime;

        await ref.update(data);
        res.json({ _id: doc.id, ...data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
exports.deleteService = async (req, res) => {
    try {
        const ref = db.collection('services').doc(req.params.id);
        const doc = await ref.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (doc.data().businessId !== req.user.uid) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await ref.delete();
        res.json({ message: 'Service deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
