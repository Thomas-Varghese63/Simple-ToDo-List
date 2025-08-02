// D:\to-do-list\server.js

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Add this line
const todoRoutes = require('./routes/todoRoutes');
const authRoutes = require('./routes/authRoutes'); // Add this line

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// --- Middleware ---
app.use(cors({
  origin: 'http://localhost:5173', // Your React app URL
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())

// --- MongoDB Connection ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// --- API Routes ---
app.use('/api/auth', authRoutes); // Add auth routes
app.use('/api/todos', todoRoutes);

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
