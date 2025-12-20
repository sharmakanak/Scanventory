// Mongoose model for inventory items
// Each item will have a QR code that encodes the MongoDB _id

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    qrCode: {
      // We will store a data URL string of the generated QR code image
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Item', itemSchema);


