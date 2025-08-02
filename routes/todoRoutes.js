// D:\to-do-list\routes\todoRoutes.js

const express = require('express');
const router = express.Router();
const Todo = require('../models/todoModel');
const mongoose = require('mongoose'); // Add this line
const { protect } = require('../middleware/authMiddleware'); // Import middleware

// --- API Endpoints (CRUD Operations) ---

// GET all To-Do items for the authenticated user
router.get('/', protect, async (req, res) => { // Apply protect middleware
    try {
        const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 }); // Filter by user ID
        res.status(200).json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ message: 'Server error fetching todos', error: error.message });
    }
});

// POST a new To-Do item for the authenticated user
router.post('/', protect, async (req, res) => { // Apply protect middleware
    const { text, priority, dueDate } = req.body;

    if (!text || text.trim() === '') {
        return res.status(400).json({ message: 'Task text cannot be empty.' });
    }

    try {
        const newTodo = new Todo({
            user: req.user.id, // Assign task to the authenticated user
            text: text.trim(),
            priority: priority || '',
            dueDate: dueDate ? new Date(dueDate) : null
        });
        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (error) {
        console.error('Error adding todo:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message, errors: error.errors });
        }
        res.status(500).json({ message: 'Server error adding todo', error: error.message });
    }
});

// PATCH (Update) a To-Do item by ID for the authenticated user
router.patch('/:id', protect, async (req, res) => { // Apply protect middleware
    const { id } = req.params;
    const updates = req.body;

    if (updates.dueDate) {
        updates.dueDate = new Date(updates.dueDate);
    }

    try {
        // Find task by ID and ensure it belongs to the authenticated user
        const todo = await Todo.findOne({ _id: id, user: req.user.id });

        if (!todo) {
            return res.status(404).json({ message: 'To-Do item not found or not authorized.' });
        }

        // Update the task
        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedTodo);
    } catch (error) {
        console.error('Error updating todo:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid To-Do ID format.' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message, errors: error.errors });
        }
        res.status(500).json({ message: 'Server error updating todo', error: error.message });
    }
});

// DELETE a To-Do item by ID for the authenticated user
router.delete('/:id', protect, async (req, res) => { // Apply protect middleware
    const { id } = req.params;
    
    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid To-Do ID format.' });
        }

        const deletedTodo = await Todo.findOneAndDelete({
            _id: id,
            user: req.user.id
        });

        if (!deletedTodo) {
            return res.status(404).json({ message: 'To-Do item not found or not authorized.' });
        }

        res.status(200).json({ message: 'To-Do item deleted successfully.' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ message: 'Server error deleting todo' });
    }
});

module.exports = router;