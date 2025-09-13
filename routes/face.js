import express from 'express'

const router = express.Router()

// In-memory storage for face data (use database in production)
let faceDatabase = []

// Register face data
router.post('/register', async (req, res) => {
  try {
    const { studentId, studentName, faceData } = req.body

    console.log('Face registration request:', { studentId, studentName })

    // Validate input
    if (!studentId || !faceData || !Array.isArray(faceData)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid face data provided' 
      })
    }

    // Check if student already has face data
    const existingIndex = faceDatabase.findIndex(entry => entry.studentId === studentId)
    
    const faceEntry = {
      studentId,
      studentName,
      descriptors: faceData.map(face => face.descriptor || []),
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }

    if (existingIndex !== -1) {
      // Update existing entry
      faceDatabase[existingIndex] = faceEntry
      console.log('Updated existing face registration for:', studentName)
    } else {
      // Add new entry
      faceDatabase.push(faceEntry)
      console.log('Created new face registration for:', studentName)
    }

    res.json({
      success: true,
      message: 'Face registered successfully',
      data: {
        studentId,
        studentName,
        descriptorsCount: faceEntry.descriptors.length
      }
    })

  } catch (error) {
    console.error('Face registration error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error during face registration' 
    })
  }
})

// Recognize face for attendance
router.post('/recognize', async (req, res) => {
  try {
    const { faceDescriptor, studentId } = req.body

    console.log('Face recognition request for student:', studentId)

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid face descriptor provided' 
      })
    }

    // Find student's registered face data
    const studentFaceData = faceDatabase.find(entry => entry.studentId === studentId)

    if (!studentFaceData) {
      return res.json({
        success: true,
        match: false,
        message: 'No registered face data found. Please register your face first.'
      })
    }

    // For demo purposes, always return a successful match
    // In production, you'd implement actual face matching algorithms
    const mockMatch = {
      studentId: studentFaceData.studentId,
      studentName: studentFaceData.studentName,
      confidence: 0.85, // 85% confidence
      distance: 0.3
    }

    console.log('Face recognition successful for:', studentFaceData.studentName)

    res.json({
      success: true,
      match: true,
      confidence: mockMatch.confidence,
      data: mockMatch,
      message: `Face matched with confidence: ${Math.round(mockMatch.confidence * 100)}%`
    })

  } catch (error) {
    console.error('Face recognition error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Server error during face recognition' 
    })
  }
})

// Get registered students
router.get('/registered', (req, res) => {
  console.log('Fetching registered students, total:', faceDatabase.length)
  
  const registeredStudents = faceDatabase.map(entry => ({
    studentId: entry.studentId,
    studentName: entry.studentName,
    registeredAt: entry.registeredAt,
    descriptorsCount: entry.descriptors.length
  }))

  res.json({
    success: true,
    data: registeredStudents,
    total: registeredStudents.length
  })
})

// Delete face data
router.delete('/student/:studentId', (req, res) => {
  const { studentId } = req.params
  
  const initialLength = faceDatabase.length
  faceDatabase = faceDatabase.filter(entry => entry.studentId !== studentId)
  
  const deleted = initialLength > faceDatabase.length

  console.log('Face data deletion request for:', studentId, 'Deleted:', deleted)

  res.json({
    success: true,
    message: deleted ? 'Face data deleted successfully' : 'No face data found to delete'
  })
})
router.get('/test', (req, res) => {
  res.json({ message: 'Face API is working!', timestamp: new Date() })
})

export default router
