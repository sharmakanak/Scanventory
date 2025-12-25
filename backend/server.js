// Simple Express server setup with MongoDB connection

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Import routes
const itemRoutes = require('./src/routes/itemRoutes');
const authRoutes = require('./src/routes/authRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

app.use('/api/items', itemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Inventory API is running' });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/qr_inventory';
const PORT = process.env.PORT || 5000;


mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });


