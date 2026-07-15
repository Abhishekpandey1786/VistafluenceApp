require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./utils/Socket');
const { startSubscriptionExpiryCron } = require('./utils/subscriptionCron');
const app = express();
const server = http.createServer(app);

const io = initSocket(server);
app.set('io', io);

connectDB();

startSubscriptionExpiryCron();

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