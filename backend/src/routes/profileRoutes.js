// REST API routes for user profile and settings

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

// GET /api/profile — Get current user's profile
router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json(user);
    } catch (err) {
        console.error('Error fetching profile:', err.message);
        return res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/profile — Update name
router.put('/', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters.' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        user.name = name.trim();
        await user.save();
        return res.json({ message: 'Profile updated.', name: user.name });
    } catch (err) {
        console.error('Error updating profile:', err.message);
        return res.status(500).json({ message: 'Server error.' });
    }
});

// PUT /api/profile/password — Change password
router.put('/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new password are required.' });
        }
        if (typeof newPassword !== 'string' || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(401).json({ message: 'Current password is incorrect.' });

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        return res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error('Error changing password:', err.message);
        return res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
