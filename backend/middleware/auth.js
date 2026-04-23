const { auth } = require('../config/firebase');

// Protect routes – verify Firebase ID Token
const protect = async (req, res, next) => {
    try {
        let token;
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.query && req.query.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // Verify Firebase Token
        const decodedToken = await auth.verifyIdToken(token);
        
        // Find the user role/custom data in Firestore
        const { db } = require('../config/firebase');
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User profile not found in database. Complete registration.' });
        }

        const userData = userDoc.data();
        req.user = {
            _id: decodedToken.uid, // Map uid to _id so old code doesn't break
            uid: decodedToken.uid,
            email: decodedToken.email,
            name: userData.name,
            role: userData.role
        };

        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ message: `Auth Error: ${error.message}` });
    }
};

// Role-based access
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: `Role '${req.user.role}' is not authorized` });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
