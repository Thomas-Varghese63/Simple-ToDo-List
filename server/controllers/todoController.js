const Todo = require('../models/todoModel');
const mongoose = require('mongoose');

const VALID_PRIORITIES = ['low', 'medium', 'high', ''];

class TodoController {
    async getAllTodos(req, res) {
        try {
            const todos = await Todo.find({ user: req.user.id }).sort({ createdAt: -1 });
            res.status(200).json(todos);
        } catch (error) {
            console.error('Error fetching todos:', error);
            res.status(500).json({ message: 'Server error fetching todos', error: error.message });
        }
    }

    async createTodo(req, res) {
        const { text, priority, dueDate } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Task text cannot be empty.' });
        }

        if (priority && !VALID_PRIORITIES.includes(priority)) {
            return res.status(400).json({ message: 'Invalid priority value.' });
        }

        try {
            const newTodo = new Todo({
                user: req.user.id,
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
    }

    async updateTodo(req, res) {
        const { id } = req.params;
        const updates = req.body;

        if (updates.dueDate) {
            updates.dueDate = new Date(updates.dueDate);
        }

        try {
            const todo = await Todo.findOne({ _id: id, user: req.user.id });

            if (!todo) {
                return res.status(404).json({ message: 'To-Do item not found or not authorized.' });
            }

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
    }

    async deleteTodo(req, res) {
        const { id } = req.params;
        
        try {
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
    }
}

module.exports = new TodoController();