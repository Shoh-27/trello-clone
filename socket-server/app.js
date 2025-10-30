const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Store connected clients by board ID
const boardRooms = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join board room
    socket.on('joinBoard', (boardId) => {
        socket.join(`board_${boardId}`);
        console.log(`Client ${socket.id} joined board ${boardId}`);

        // Track connected clients
        if (!boardRooms.has(boardId)) {
            boardRooms.set(boardId, new Set());
        }
        boardRooms.get(boardId).add(socket.id);
    });

    // Leave board room
    socket.on('leaveBoard', (boardId) => {
        socket.leave(`board_${boardId}`);
        console.log(`Client ${socket.id} left board ${boardId}`);

        if (boardRooms.has(boardId)) {
            boardRooms.get(boardId).delete(socket.id);
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        // Remove from all board rooms
        boardRooms.forEach((clients, boardId) => {
            clients.delete(socket.id);
        });
    });
});

// HTTP endpoint to receive events from Laravel
app.post('/events', (req, res) => {
    const { event, boardId, action, data } = req.body;

    if (!event || !boardId) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    console.log(`Broadcasting event: ${event} to board ${boardId} (action: ${action})`);

    // Broadcast to all clients in the board room
    io.to(`board_${boardId}`).emit(event, {
        action,
        data,
        timestamp: new Date().toISOString()
    });

    res.json({ success: true, message: 'Event broadcasted' });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        connections: io.engine.clientsCount,
        boardRooms: boardRooms.size
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});