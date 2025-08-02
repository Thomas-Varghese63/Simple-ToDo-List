import Cookies from 'js-cookie'
import { useState, useEffect } from "react"

import { Check, Plus, Calendar, Flag, Edit3, Trash2, Star, LogOut, User } from "lucide-react"
import "./todo-app.css"

const API_URL = 'http://localhost:5000/api/todos';

const priorities = [
  { value: "low", label: "Low", color: "#10b981" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#ef4444" },
]

export default function TodoApp({ user = {}, onLogout = () => {} }) {
 
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [newPriority, setNewPriority] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [editingTask, setEditingTask] = useState(null)
  const [editText, setEditText] = useState("")

  // Load tasks from API on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fallback for user name
  const userName = user?.name ? user.name : "User";
  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL, {
        credentials: 'include', // Send cookies with this request
      });
      if (response.status === 401) {
          // If not authorized, redirect to login
          onLogout();
          return;
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Consider handling network errors or session expiry more gracefully
    }
  };

  const addTask = async () => {
    if (newTask.trim() !== "") {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: newTask.trim(),
            priority: newPriority,
            dueDate: newDueDate || undefined,
          }),
          credentials: 'include', // Send cookies with this request
        });
        if (response.status === 401) {
            onLogout();
            return;
        }
        const savedTask = await response.json();
        setTasks([savedTask, ...tasks]);
        setNewTask("");
        setNewPriority("");
        setNewDueDate("");
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

const toggleTask = async (id) => {
    try {
      const task = tasks.find(t => t._id === id);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
        credentials: 'include', // Send cookies with this request
      });
      if (response.status === 401) {
          onLogout();
          return;
      }
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

   const deleteTask = async (taskId) => {
    if (!taskId) {
        console.error('No task ID provided');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
        } else {
            const errorData = await response.json();
            console.error('Failed to delete task:', errorData);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
  };

  const startEditing = (task) => {
    setEditingTask(task._id)
    setEditText(task.text)
  }

    const saveEdit = async () => {
    if (editText.trim() !== "") {
      try {
        const response = await fetch(`${API_URL}/${editingTask}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: editText.trim(),
          }),
          credentials: 'include', // Send cookies with this request
        });
        if (response.status === 401) {
            onLogout();
            return;
        }
        const updatedTask = await response.json();
        setTasks(tasks.map((task) => (task._id === editingTask ? updatedTask : task)));
        setEditingTask(null);
        setEditText("");
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  }

    const handleLogoutClick = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Send cookies to clear the Http Only cookie
      });
      onLogout(); // Update the parent state to show the login form
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTask()
    }
  }

  const handleEditKeyPress = (e) => {
    if (e.key === "Enter") {
      saveEdit()
    } else if (e.key === "Escape") {
      cancelEdit()
    }
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditText("")
  }

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const getPriorityColor = (priority) => {
    const p = priorities.find((p) => p.value === priority)
    return p ? p.color : "#6b7280"
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="container">
      <div className="card">
        {/* Header with User Info */}
        <div className="header">
          <div className="header-left">
            <h1 className="title">✨ My To-Do List</h1>
            <div className="user-info" title={`Logged in as ${userName}`}>
              <User size={16} />
              <span>Welcome, {userName}!</span>
            </div>
          </div>
          <div className="header-right">
            <div className="stats">
              <div className="stat-item">
                <span className="stat-number">{totalTasks}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{completedTasks}</span>
                <span className="stat-label">Done</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{Math.round(completionPercentage)}%</span>
                <span className="stat-label">Progress</span>
              </div>
            </div>
            <button onClick={onLogout} className="logout-button" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {totalTasks > 0 && (
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>
        )}

        {/* Add Task Form */}
        <div className="form">
          <div className="input-row">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What needs to be done?"
              className="input"
            />
            <button onClick={addTask} className="add-button">
              <Plus size={20} />
              Add
            </button>
          </div>

          <div className="options-row">
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="select">
              <option value="" disabled>
                Priority
              </option>
              {priorities.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>

        {/* Task List */}
        <ul className="task-list">
          {tasks.map((task) => (
            <li
              key={task._id}
              className={`task-item ${task.completed ? "task-item-completed" : ""} ${
                isOverdue(task.dueDate) && !task.completed ? "task-item-overdue" : ""
              }`}
            >
              <div className="task-left">
                <button
                  onClick={() => toggleTask(task._id)}
                  className={`check-button ${task.completed ? "check-button-active" : ""}`}
                >
                  {task.completed && <Check size={16} />}
                </button>

                <div className="task-content">
                  {editingTask === task._id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleEditKeyPress}
                      onBlur={saveEdit}
                      className="edit-input"
                      autoFocus
                    />
                  ) : (
                    <div>
                      <span className={`task-text ${task.completed ? "task-text-completed" : ""}`}>{task.text}</span>
                      <div className="task-meta">
                        <span className="priority-tag" style={{ color: getPriorityColor(task.priority) }}>
                          <Flag size={12} />
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span
                            className={`due-date-tag ${isOverdue(task.dueDate) && !task.completed ? "overdue" : ""}`}
                          >
                            <Calendar size={12} />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="action-buttons">
                {editingTask !== task._id && (
                  <button onClick={() => startEditing(task)} className="action-button edit-button" title="Edit task">
                    <Edit3 size={14} />
                  </button>
                )}

                <button 
                    onClick={() => deleteTask(task._id)} 
                    className="action-button delete-button"
                    title="Delete task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="empty-state">
            <Star size={48} className="empty-icon" />
            <p className="empty-title">Ready to be productive?</p>
            <p className="empty-subtitle">Add your first task above to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}
