const { Server } = require('socket.io');

let ioInstance = null;
const onlineUsers = new Map(); // userId -> socketId

function initSocket(server) {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`⚡ Client Connected: ${socket.id}`);

    socket.on('join', (userId) => {
      if (!userId) return;
      socket.userId = userId.toString();
      onlineUsers.set(socket.userId, socket.id);
      ioInstance.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`✅ User ${socket.userId} joined (socket: ${socket.id})`);
    });

    socket.on('typing', ({ receiverId, senderId }) => {
      const receiverSocket = onlineUsers.get(receiverId?.toString());
      if (receiverSocket) {
        ioInstance.to(receiverSocket).emit('user_typing', senderId);
      }
    });

    socket.on('stop_typing', ({ receiverId, senderId }) => {
      const receiverSocket = onlineUsers.get(receiverId?.toString());
      if (receiverSocket) {
        ioInstance.to(receiverSocket).emit('user_stop_typing', senderId);
      }
    });

    socket.on('disconnect', () => {
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      ioInstance.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`🔌 Client Disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  }
  return ioInstance;
}

// Push an event straight to a specific user if they're online.
// Returns true if delivered live, false if the user is offline
// (message is still safe in the DB either way).
function emitToUser(userId, event, payload) {
  if (!ioInstance || !userId) return false;
  const socketId = onlineUsers.get(userId.toString());
  if (socketId) {
    ioInstance.to(socketId).emit(event, payload);
    return true;
  }
  return false;
}

function isUserOnline(userId) {
  return onlineUsers.has(userId?.toString());
}

module.exports = { initSocket, getIO, emitToUser, isUserOnline, onlineUsers };