const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const protect = async (req, res, next) => {
  try {
    let token

    // Check Authorization header first
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1]
    } 
    // Fallback to cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication required. Please login.' 
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('-password')
      
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found or deleted.' 
        })
      }

      req.user = user
      next()
    } catch (error) {
      console.error('Token verification failed:', error)
      res.status(401).json({ 
        message: 'Invalid or expired token. Please login again.' 
      })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ 
      message: 'Internal server error during authentication.' 
    })
  }
}

module.exports = { protect }