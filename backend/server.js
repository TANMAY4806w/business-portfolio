require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
// Import Firebase database instance
const { db } = require('./config/firebase');
const { errorHandler } = require('./middleware/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const hireRoutes = require('./routes/hireRoutes');
const messageRoutes = require('./routes/messageRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

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

// ─── Stripe Webhook Route ───────────────────────────────────────────────────
// Must be registered BEFORE express.json() so the webhook gets the raw body
const { webhook } = require('./controllers/paymentController');
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhook);

// General Middleware
app.use(helmet()); 
app.use(compression());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/payments', paymentRoutes);
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
            const hireDoc = await db.collection('hireRequests').doc(hireRequestId).get();
            if (!hireDoc.exists) {
                socket.emit('error', { message: 'Hire request not found' });
                return;
            }

            const hireRequest = hireDoc.data();

            // Verify user is part of this hire request
            const isClient = hireRequest.clientId === userId;
            const isBusiness = hireRequest.businessId === userId;

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
            const msgData = {
                senderId,
                receiverId,
                hireRequestId,
                text: text.trim(),
                createdAt: new Date().toISOString()
            };
            const newMsgRef = db.collection('messages').doc();
            await newMsgRef.set(msgData);

            let populatedData = { _id: newMsgRef.id, ...msgData };

            // Fetch sender details
            const senderDoc = await db.collection('users').doc(senderId).get();
            populatedData.senderId = {
                _id: senderId,
                name: senderDoc.exists ? senderDoc.data().name : 'Unknown'
            };

            // Emit to everyone in the room
            io.to(hireRequestId).emit('newMessage', populatedData);
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

app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running safely on port ${PORT}`);
});
