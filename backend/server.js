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

app.use('/api/items', itemRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Inventory API is running' });
});

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/qr_inventory';
const PORT = process.env.PORT || 5000;

// With Mongoose 9+, the legacy options like useNewUrlParser/useUnifiedTopology
// are no longer needed or supported. Just pass the URI.
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


