
const mongoose = require('mongoose');
const todoSchema = new mongoose.Schema({
     user: { 
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // References the User model
    },
    text: {
        type: String,
        required: [true, 'Task text is required'],
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', ''], // Empty string for no priority
        default: ''
    },
    dueDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo; 
