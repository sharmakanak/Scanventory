// REST API routes for user authentication
// Handles signup and login functionality

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const router = express.Router();

// Crash at startup if JWT_SECRET is not configured in .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
    process.exit(1);
}

// Rate limiter: max 10 auth requests per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        message: 'Too many attempts from this IP. Please try again after 15 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiter to all auth routes
router.use(authLimiter);

// --- Simple input validation helpers ---
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSignupBody(body) {
    const errors = [];
    const { name, email, password } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters.');
    }
    if (!email || !isValidEmail(email)) {
        errors.push('A valid email address is required.');
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters.');
    }
    return errors;
}

function validateLoginBody(body) {
    const errors = [];
    const { email, password } = body;

    if (!email || !isValidEmail(email)) {
        errors.push('A valid email address is required.');
    }
    if (!password || typeof password !== 'string' || password.trim() === '') {
        errors.push('Password is required.');
    }
    return errors;
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        // Input validation
        const errors = validateSignupBody(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors[0] });
        }

        const { name, email, password } = req.body;

        // Checking if the user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        console.error('Error during signup:', err.message);
        return res.status(500).json({ message: 'Server error during signup.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        // Input validation
        const errors = validateLoginBody(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ message: errors[0] });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (err) {
        console.error('Error during login:', err.message);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;
