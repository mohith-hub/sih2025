import express from 'express'

const router = express.Router()

// Mock data for classes and attendance
let attendanceData = []
let classData = {
  name: 'Computer Science',
  totalCount: 45,
  presentCount: 38
}

// Mark attendance (handles both QR and Face recognition)
router.post('/mark', async (req, res) => {
  try {
    const { studentId, method, qrData, faceRecognitionData } = req.body
    
    console.log(`Attendance marking request - Student: ${studentId}, Method: ${method}`)

    // Validate input
    if (!studentId || !method) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and method are required'
      })
    }

    // Check if student already marked attendance today
    const today = new Date().toDateString()
    const existingAttendance = attendanceData.find(
      record => record.studentId === studentId && record.date === today
    )

    if (existingAttendance) {
      return res.json({
        success: false,
        message: 'Attendance already marked for today'
      })
    }

    // Create attendance record
    const attendanceRecord = {
      studentId,
      method,
      timestamp: new Date().toISOString(),
      date: today,
      classInfo: { ...classData }
    }

    // Handle different marking methods
    if (method === 'qr') {
      attendanceRecord.qrData = qrData
      console.log('QR Code attendance marked for student:', studentId)
    } else if (method === 'face') {
      attendanceRecord.faceRecognitionData = faceRecognitionData
      console.log('Face recognition attendance marked for student:', studentId)
    }

    // Add to attendance data
    attendanceData.push(attendanceRecord)
    
    // Update present count
    classData.presentCount = Math.min(classData.presentCount + 1, classData.totalCount)

    res.json({
      success: true,
      message: `Attendance marked successfully via ${method}`,
      method: method,
      timestamp: attendanceRecord.timestamp,
      classInfo: {
        name: classData.name,
        presentCount: classData.presentCount,
        totalCount: classData.totalCount
      }
    })

  } catch (error) {
    console.error('Attendance marking error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while marking attendance'
    })
  }
})

// Get attendance records
router.get('/records', (req, res) => {
  res.json({
    success: true,
    data: attendanceData,
    total: attendanceData.length,
    classInfo: classData
  })
})

// Get today's attendance
router.get('/today', (req, res) => {
  const today = new Date().toDateString()
  const todayRecords = attendanceData.filter(record => record.date === today)
  
  res.json({
    success: true,
    data: todayRecords,
    total: todayRecords.length,
    classInfo: classData
  })
})

export default router
