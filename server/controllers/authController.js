const User = require('../models/userModel'); 
const jwt = require('jsonwebtoken');

class AuthController {
    generateToken(id) {
        try {
            return jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });
        } catch (error) {
            console.error('Token generation error:', error);
            throw new Error('Failed to generate authentication token');
        }
    }

    async signup(req, res) {
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

            const token = this.generateToken(user._id);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000,
                sameSite: 'Lax',
            });

            res.status(201).json({
                id: user._id,
                name: user.name,
                email: user.email
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        }
    }

    async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });
            if (!user || !(await user.matchPassword(password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = this.generateToken(user._id);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000,
                sameSite: 'Lax',
            });

            res.json({
                id: user._id,
                name: user.name,
                email: user.email
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }

    logout(req, res) {
        res.cookie('token', '', {
            httpOnly: true,
            expires: new Date(0),
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
        });
        res.json({ message: 'Logged out successfully' });
    }

    async getProfile(req, res) {
        try {
            res.json({
                id: req.user._id,
                name: req.user.name,
                email: req.user.email
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            res.status(500).json({ message: 'Error fetching user data' });
        }
    }
}

module.exports = new AuthController();