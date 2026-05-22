import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io on HTTP Server
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Socket connection listener
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Realtime Socket. ID: ${socket.id}`);

  // Join order room for tracking updates
  socket.on('join_order', (orderId: string) => {
    socket.join(`order_${orderId}`);
    console.log(`👤 Client joined room for Order: ${orderId}`);
  });

  // Chat message event handler
  socket.on('send_message', (data: { orderId: string; senderId: string; senderName: string; content: string }) => {
    console.log(`💬 Chat message in Order ${data.orderId} from ${data.senderName}: ${data.content}`);
    
    // Broadcast back to the room members
    io.to(`order_${data.orderId}`).emit('chat_message', {
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      timestamp: new Date()
    });
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Run server after database hook
const startServer = async () => {
  await connectDB();
  
  // Try to connect to Redis (optional - app works without it)
  connectRedis();
  
  server.listen(PORT, () => {
    console.log(`🚀 NearNest Hyperlocal Server running on: http://localhost:${PORT}`);
  });
};

startServer();
