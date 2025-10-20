
const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');
const { protect } = require('../middleware/authMiddleware');


// GET all To-Do items 
router.get('/', protect, todoController.getAllTodos);

// POST a new To-Do item 
router.post('/', protect, todoController.createTodo);

// PATCH (Update) a To-Do item 
router.patch('/:id', protect, todoController.updateTodo);

// DELETE a To-Do item 
router.delete('/:id', protect, todoController.deleteTodo);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Todo route error:', err);
    res.status(500).json({ message: 'Internal server error in todo route' });
});

module.exports = router;