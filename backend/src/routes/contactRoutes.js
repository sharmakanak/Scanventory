// REST API routes for contact form

const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

// POST /api/contact
// Submit a contact form message
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Create new contact submission
        const contact = new Contact({
            name,
            email,
            message,
        });

        await contact.save();

        console.log('New contact submission:', { name, email, timestamp: new Date() });

        return res.status(201).json({
            message: 'Thank you for contacting us! We will get back to you soon.',
        });
    } catch (err) {
        console.error('Error submitting contact form:', err.message);
        return res.status(500).json({ message: 'Server error while submitting form.' });
    }
});

module.exports = router;
