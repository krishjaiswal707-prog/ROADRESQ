const { Server } = require('socket.io');
const { getCityRoom, SOCKET_EVENTS } = require('../shared/types/contracts');

let ioInstance = null;

function initSocketServer(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Allow client to subscribe to specific city channel
    socket.on('city:join', ({ cityId }) => {
      const room = getCityRoom(cityId);
      socket.join(room);
      console.log(`📡 Socket ${socket.id} joined room: ${room}`);
      socket.emit('city:joined', { room, cityId, timestamp: new Date() });
    });

    socket.on('city:leave', ({ cityId }) => {
      const room = getCityRoom(cityId);
      socket.leave(room);
      console.log(`🚪 Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized yet.');
  }
  return ioInstance;
}

function broadcastToCity(cityId, event, payload) {
  if (ioInstance) {
    const room = getCityRoom(cityId);
    ioInstance.to(room).emit(event, { ...payload, cityId, isRealtime: true });
    // Also emit globally for backward-compatibility with initial dashboards
    ioInstance.emit(event, payload);
  }
}

module.exports = {
  initSocketServer,
  getIO,
  broadcastToCity,
  SOCKET_EVENTS
};

