const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const photoRoutes = require('./routes/photoRoutes');
const startCleanupJob = require('./jobs/cleanup');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Env Status Check
console.log('--- Environment Configuration ---');
console.log(`PORT: ${process.env.PORT || 5000}`);
console.log(`MONGO_URI: ${process.env.MONGO_URI ? 'Defined' : 'MISSING'}`);
console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || 'MISSING'}`);
console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? 'Defined' : 'MISSING'}`);
console.log(`CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? 'Defined' : 'MISSING'}`);
console.log('---------------------------------');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/photos', photoRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Start Cron Job
startCleanupJob();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Increase timeout for AI processing
server.timeout = 300000; // 5 minutes
