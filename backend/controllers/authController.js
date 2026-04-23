const { db, auth } = require('../config/firebase');

// @desc    Register a new user profile in Firestore
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, role, uid } = req.body;

        // Ensure token was passed to verify authenticity of this request
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'No Firebase token provided' });
        }

        const decodedToken = await auth.verifyIdToken(token);

        // Security check: Make sure UID from token matches body UID
        if (decodedToken.uid !== uid) {
            return res.status(403).json({ message: 'UID mismatch' });
        }

        if (!name || !email || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!['business', 'client'].includes(role)) {
            return res.status(400).json({ message: 'Role must be business or client' });
        }

        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();

        if (doc.exists) {
            return res.status(400).json({ message: 'User profile already exists' });
        }

        const userData = {
            name,
            email,
            role,
            createdAt: new Date().toISOString()
        };

        await userRef.set(userData);

        res.status(201).json({
            _id: uid,
            uid: uid,
            name,
            email,
            role
        });
    } catch (error) {
        console.error('Register Auth Controller Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// Note: This route uses the main `protect` middleware which guarantees `req.user` exists.
exports.getMe = async (req, res) => {
    try {
        res.json({
            _id: req.user.uid,
            uid: req.user.uid,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
