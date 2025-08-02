const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware'); // protect middleware

// to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

//  POST /api/auth/signup
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ name, email, password });
        await user.save();

        const token = generateToken(user._id);

        // Set JWT as Http Only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', //secure cookies in production
            maxAge: 3600000, // 1 hour
            sameSite: 'Lax', // Or 'None' if cross-site, but require secure: true
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            message: 'Registration successful'
        });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 11000) 
            { 
                // Duplicate key error for email
         return res.status(400).json({ message: 'An account with this email already exists.' });
        }
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
});

// POST /api/auth/login

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        // Set JWT as Http Only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
            sameSite: 'Lax',
        });

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
});

//    GET /api/auth/logout
router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0), // Set to a past date to expire immediately
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// GET /api/auth/me

router.get('/me', protect, async (req, res) => {
  try {
    // User is already attached by protect middleware
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    res.status(500).json({ message: 'Error fetching user data' })
  }
})


module.exports = router;