// Mongoose model for activity/audit log
// Records every inventory action: create, update, delete, quantity_change

const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
            index: true,
        },
        itemName: {
            type: String,
            required: true,
        },
        // 'created' | 'updated' | 'deleted' | 'quantity_changed'
        action: {
            type: String,
            required: true,
            enum: ['created', 'updated', 'deleted', 'quantity_changed'],
        },
        // For quantity_changed: the numeric change (positive or negative)
        delta: {
            type: Number,
            default: null,
        },
        // Snapshot of quantity after the change
        quantityAfter: {
            type: Number,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
