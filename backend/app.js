require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./utils/socket');

const app = express();
const server = http.createServer(app);

// ✅ Socket.io ab centralized util se init hota hai — routes/messaging.js
// isi instance ko use karke realtime push karega
const io = initSocket(server);

// ✅ IMPORTANT: purane routes (jaise campaign like/comment) jo
// req.app.get('io') use karte hain, unke liye backward compatibility
app.set('io', io);

connectDB();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/influencers', require('./routes/influencer'));
app.use('/api/campaigns', require('./routes/campaign'));
app.use('/api/messages', require('./routes/messaging'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/brand', require('./routes/brand'));
app.use('/api/profile', require('./routes/brand'));
app.use('/api/influencer', require('./routes/influencer'));
app.use('/api/instamojo', require('./routes/instamojo'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/academy', require('./routes/Academy'));

app.get('/', (req, res) => res.json({ message: '🌟 Vista Fluence API Running' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Vistafluence Core Server running on port ${PORT}`));