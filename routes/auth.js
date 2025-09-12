import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Demo users for testing
const DEMO_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'student@sih.edu',
    password: 'password123',
    role: 'student',
    interests: ['Programming', 'Machine Learning'],
    goals: ['Software Engineer', 'Data Scientist']
  },
  {
    id: '2',
    name: 'Dr. Smith',
    email: 'teacher@sih.edu',
    password: 'password123',
    role: 'teacher'
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@sih.edu',
    password: 'password123',
    role: 'admin'
  }
]

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body

    // Find demo user
    const user = DEMO_USERS.find(u => 
      u.email === email && 
      u.password === password && 
      u.role === role
    )

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials or role' 
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: 'Login successful'
    })

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    })
  }
})

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = DEMO_USERS.find(u => u.id === decoded.userId)
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json({ success: true, user: userWithoutPassword })

  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

export default router
