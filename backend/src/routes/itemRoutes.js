// REST API routes for inventory items
// Includes CRUD operations and stock quantity updates

const express = require('express');
const QRCode = require('qrcode');
const Item = require('../models/Item');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Helper: generate QR code that encodes the item ID
async function generateQrForItemId(itemId) {
  // For simplicity, we just encode the raw MongoDB ID as a string
  const textToEncode = String(itemId);
  return QRCode.toDataURL(textToEncode);
}

// POST /api/items
// Create a new inventory item and generate its QR code
router.post('/', async (req, res) => {
  try {
    const { itemName, category, quantity, location } = req.body;

    if (!itemName || !category || quantity == null || !location) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const item = new Item({
      itemName,
      category,
      quantity,
      location,
      userId: req.userId, // Associate item with logged-in user
    });

    // First save to get the Mongo _id
    const savedItem = await item.save();

    // Generate QR code based on the item ID
    const qrCodeDataUrl = await generateQrForItemId(savedItem._id);

    savedItem.qrCode = qrCodeDataUrl;
    const finalItem = await savedItem.save();

    return res.status(201).json(finalItem);
  } catch (err) {
    console.error('Error creating item:', err.message);
    return res.status(500).json({ message: 'Server error while creating item.' });
  }
});

// GET /api/items
// Get all items for the logged-in user
router.get('/', async (req, res) => {
  try {
    const items = await Item.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    console.error('Error fetching items:', err.message);
    return res.status(500).json({ message: 'Server error while fetching items.' });
  }
});

// GET /api/items/:id
// Get a single item by ID (only if it belongs to the user)
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }
    return res.json(item);
  } catch (err) {
    console.error('Error fetching item:', err.message);
    return res.status(500).json({ message: 'Server error while fetching item.' });
  }
});

// PATCH /api/items/:id/quantity
// Update stock quantity (only for user's own items)
router.patch('/:id/quantity', async (req, res) => {
  try {
    const { delta } = req.body; // positive or negative number

    if (typeof delta !== 'number') {
      return res.status(400).json({ message: 'delta (number) is required.' });
    }

    const item = await Item.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    const newQuantity = item.quantity + delta;

    if (newQuantity < 0) {
      return res.status(400).json({ message: 'Quantity cannot be negative.' });
    }

    item.quantity = newQuantity;
    const updatedItem = await item.save();

    return res.json(updatedItem);
  } catch (err) {
    console.error('Error updating quantity:', err.message);
    return res.status(500).json({ message: 'Server error while updating quantity.' });
  }
});

module.exports = router;


