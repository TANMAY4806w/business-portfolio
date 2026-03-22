const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (!['business', 'client'].includes(role)) {
            return res.status(400).json({ message: 'Role must be business or client' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({ name, email, password, role });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        res.json({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google Login/Signup
// @route   POST /api/auth/google
exports.googleLogin = async (req, res) => {
    try {
        const { token, role } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Google token is required' });
        }

        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: avatar } = payload;

        let user = await User.findOne({ email });

        if (user) {
            // Existing user - update details if needed
            let updated = false;
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.avatar) user.avatar = avatar;
                updated = true;
            }
            // If role is explicitly provided (via Register page) and differs, update it
            if (role && ['business', 'client'].includes(role) && user.role !== role) {
                user.role = role;
                updated = true;
            }
            if (updated) {
                await user.save();
            }
        } else {
            // New user registration
            if (!role || !['business', 'client'].includes(role)) {
                return res.status(400).json({ message: 'Role (business or client) is required for new Google registration' });
            }
            user = await User.create({
                name,
                email,
                role,
                googleId,
                avatar,
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error('Google Auth Error:', error.message);
        res.status(500).json({ message: 'Failed to authenticate with Google' });
    }
};
