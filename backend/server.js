
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const itemRoutes = require('./src/routes/itemRoutes');
const authRoutes = require('./src/routes/authRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const profileRoutes = require('./src/routes/profileRoutes');

// API routes
app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Scanventory API is running',
        status: 'success'
    });
});

// Environment variables
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is missing from environment variables');
        }

        await mongoose.connect(MONGO_URI);

        console.log('MongoDB Atlas connected successfully');

        app.listen(PORT, () => {
            console.log(`Scanventory API running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Server startup error:', error.message);
        process.exit(1);
    }
};

startServer();
