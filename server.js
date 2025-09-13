import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import attendanceRoutes from './routes/attendance.js'
import faceRoutes from './routes/face.js'  // Add this import

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' })) // Increase limit for face images
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/face', faceRoutes)  // Add this route

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Smart Attendance API with Face Recognition is running!',
    timestamp: new Date().toISOString(),
    features: ['QR Code Attendance', 'Face Recognition', 'Real-time Updates']
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`)
  console.log(`📋 Attendance endpoint: http://localhost:${PORT}/api/attendance/mark`)
  console.log(`👤 Face recognition: http://localhost:${PORT}/api/face/`)
})
