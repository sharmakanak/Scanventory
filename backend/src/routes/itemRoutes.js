// REST API routes for inventory items
// Includes full CRUD, stock quantity updates, and activity logging

const express = require('express');
const QRCode = require('qrcode');
const Item = require('../models/Item');
const ActivityLog = require('../models/ActivityLog');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function generateQrForItemId(itemId) {
    return QRCode.toDataURL(String(itemId));
}

function validateItemBody(body) {
    const errors = [];
    const { itemName, category, quantity, location } = body;
    if (!itemName || typeof itemName !== 'string' || itemName.trim().length === 0)
        errors.push('Item name is required.');
    if (!category || typeof category !== 'string' || category.trim().length === 0)
        errors.push('Category is required.');
    if (quantity == null || isNaN(Number(quantity)) || Number(quantity) < 0 || !Number.isInteger(Number(quantity)))
        errors.push('Quantity must be a non-negative whole number.');
    if (!location || typeof location !== 'string' || location.trim().length === 0)
        errors.push('Location is required.');
    return errors;
}

async function logActivity(userId, itemId, itemName, action, delta = null, quantityAfter = null) {
    try {
        await ActivityLog.create({ userId, itemId, itemName, action, delta, quantityAfter });
    } catch (err) {
        console.error('ActivityLog write failed (non-fatal):', err.message);
    }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/items — Create item
router.post('/', async (req, res) => {
    try {
        const errors = validateItemBody(req.body);
        if (errors.length > 0) return res.status(400).json({ message: errors[0] });

        const { itemName, category, quantity, location, description, sku, unitPrice } = req.body;

        const item = new Item({
            itemName: itemName.trim(),
            category: category.trim(),
            quantity: Number(quantity),
            location: location.trim(),
            description: description ? String(description).trim() : '',
            sku: sku ? String(sku).trim() : '',
            unitPrice: unitPrice != null && !isNaN(Number(unitPrice)) ? Number(unitPrice) : null,
            userId: req.userId,
        });

        const savedItem = await item.save();
        savedItem.qrCode = await generateQrForItemId(savedItem._id);
        const finalItem = await savedItem.save();

        await logActivity(req.userId, finalItem._id, finalItem.itemName, 'created', null, finalItem.quantity);
        return res.status(201).json(finalItem);
    } catch (err) {
        console.error('Error creating item:', err.message);
        return res.status(500).json({ message: 'Server error while creating item.' });
    }
});

// GET /api/items — Get all items for user
router.get('/', async (req, res) => {
    try {
        const items = await Item.find({ userId: req.userId }).sort({ createdAt: -1 });
        return res.json(items);
    } catch (err) {
        console.error('Error fetching items:', err.message);
        return res.status(500).json({ message: 'Server error while fetching items.' });
    }
});

// GET /api/items/:id — Get single item
router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.id, userId: req.userId });
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        return res.json(item);
    } catch (err) {
        console.error('Error fetching item:', err.message);
        return res.status(500).json({ message: 'Server error while fetching item.' });
    }
});

// PUT /api/items/:id — Update item
router.put('/:id', async (req, res) => {
    try {
        const errors = validateItemBody(req.body);
        if (errors.length > 0) return res.status(400).json({ message: errors[0] });

        const { itemName, category, quantity, location, description, sku, unitPrice } = req.body;

        const item = await Item.findOne({ _id: req.params.id, userId: req.userId });
        if (!item) return res.status(404).json({ message: 'Item not found.' });

        item.itemName = itemName.trim();
        item.category = category.trim();
        item.quantity = Number(quantity);
        item.location = location.trim();
        item.description = description ? String(description).trim() : '';
        item.sku = sku ? String(sku).trim() : '';
        item.unitPrice = unitPrice != null && !isNaN(Number(unitPrice)) ? Number(unitPrice) : null;

        const updatedItem = await item.save();
        await logActivity(req.userId, updatedItem._id, updatedItem.itemName, 'updated', null, updatedItem.quantity);
        return res.json(updatedItem);
    } catch (err) {
        console.error('Error updating item:', err.message);
        return res.status(500).json({ message: 'Server error while updating item.' });
    }
});

// PATCH /api/items/:id/quantity — Adjust stock quantity
router.patch('/:id/quantity', async (req, res) => {
    try {
        const { delta } = req.body;
        if (typeof delta !== 'number' || !Number.isFinite(delta))
            return res.status(400).json({ message: 'delta must be a finite number.' });

        const item = await Item.findOne({ _id: req.params.id, userId: req.userId });
        if (!item) return res.status(404).json({ message: 'Item not found.' });

        const newQuantity = item.quantity + delta;
        if (newQuantity < 0)
            return res.status(400).json({ message: 'Quantity cannot go below zero.' });

        item.quantity = newQuantity;
        const updatedItem = await item.save();
        await logActivity(req.userId, updatedItem._id, updatedItem.itemName, 'quantity_changed', delta, updatedItem.quantity);
        return res.json(updatedItem);
    } catch (err) {
        console.error('Error updating quantity:', err.message);
        return res.status(500).json({ message: 'Server error while updating quantity.' });
    }
});

// DELETE /api/items/:id — Delete item
router.delete('/:id', async (req, res) => {
    try {
        const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!item) return res.status(404).json({ message: 'Item not found.' });
        await logActivity(req.userId, item._id, item.itemName, 'deleted', null, 0);
        return res.json({ message: 'Item deleted successfully.' });
    } catch (err) {
        console.error('Error deleting item:', err.message);
        return res.status(500).json({ message: 'Server error while deleting item.' });
    }
});

// GET /api/items/:id/history — Activity log for one item
router.get('/:id/history', async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.id, userId: req.userId });
        if (!item) return res.status(404).json({ message: 'Item not found.' });

        const logs = await ActivityLog.find({ itemId: req.params.id, userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        return res.json(logs);
    } catch (err) {
        console.error('Error fetching history:', err.message);
        return res.status(500).json({ message: 'Server error while fetching history.' });
    }
});

// GET /api/activity — Recent activity across all items (last 30)
router.get('/activity/recent', async (req, res) => {
    try {
        const logs = await ActivityLog.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(30);
        return res.json(logs);
    } catch (err) {
        console.error('Error fetching recent activity:', err.message);
        return res.status(500).json({ message: 'Server error while fetching activity.' });
    }
});

module.exports = router;
