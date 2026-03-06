require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const hireRoutes = require('./routes/hireRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Import models for Socket.io
const Message = require('./models/Message');
const HireRequest = require('./models/HireRequest');

const app = express();
const server = http.createServer(app);

// CORS origins
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.CLIENT_URL,
].filter(Boolean);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/hire', hireRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Socket.io Real-Time Chat ───────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a chat room (keyed by hireRequestId)
    socket.on('joinRoom', async ({ hireRequestId, userId }) => {
        try {
            const hireRequest = await HireRequest.findById(hireRequestId);
            if (!hireRequest) {
                socket.emit('error', { message: 'Hire request not found' });
                return;
            }

            // Verify user is part of this hire request
            const isClient = hireRequest.clientId.toString() === userId;
            const isBusiness = hireRequest.businessId.toString() === userId;

            if (!isClient && !isBusiness) {
                socket.emit('error', { message: 'Not authorized to join this chat' });
                return;
            }

            socket.join(hireRequestId);
            socket.hireRequestId = hireRequestId;
            socket.userId = userId;
            console.log(`User ${userId} joined room ${hireRequestId}`);
        } catch (error) {
            socket.emit('error', { message: 'Failed to join room' });
        }
    });

    // Send a message
    socket.on('sendMessage', async ({ hireRequestId, senderId, receiverId, text }) => {
        try {
            if (!text || !text.trim()) return;

            // Save message to database
            const message = await Message.create({
                senderId,
                receiverId,
                hireRequestId,
                text: text.trim(),
            });

            const populated = await message.populate('senderId', 'name');

            // Emit to everyone in the room
            io.to(hireRequestId).emit('newMessage', populated);
        } catch (error) {
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    // Typing indicator
    socket.on('typing', ({ hireRequestId, userId, name }) => {
        socket.to(hireRequestId).emit('userTyping', { userId, name });
    });

    socket.on('stopTyping', ({ hireRequestId }) => {
        socket.to(hireRequestId).emit('userStopTyping');
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
