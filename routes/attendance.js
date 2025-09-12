import express from 'express'

const router = express.Router()

// In-memory attendance storage (replace with database in production)
let attendanceRecords = []
let activeClasses = [
  {
    id: 'CS101-2025',
    name: 'Computer Science',
    teacher: 'Dr. Smith',
    location: 'Room A101',
    students: ['1'], // Student IDs
    startTime: new Date(Date.now() - 15 * 60 * 1000), // Started 15 min ago
    expectedStudents: 45,
    presentStudents: 38
  }
]

// Mark attendance via QR scan
router.post('/mark', async (req, res) => {
  try {
    const { qrData, studentId, method = 'qr' } = req.body

    // Validate QR data
    if (!qrData.classId || !qrData.timestamp) {
      return res.status(400).json({ success: false, message: 'Invalid QR code data' })
    }

    // Check if QR code is still valid (within time limit)
    const qrAge = Date.now() - qrData.timestamp
    if (qrAge > 30 * 60 * 1000) { // 30 minutes
      return res.status(400).json({ success: false, message: 'QR code has expired' })
    }

    // Find the class
    const classInfo = activeClasses.find(c => c.id === qrData.classId)
    if (!classInfo) {
      return res.status(404).json({ success: false, message: 'Class not found' })
    }

    // Check if student is enrolled
    if (!classInfo.students.includes(studentId)) {
      return res.status(403).json({ success: false, message: 'Student not enrolled in this class' })
    }

    // Check if already marked
    const existing = attendanceRecords.find(r => 
      r.studentId === studentId && 
      r.classId === qrData.classId && 
      r.date === new Date().toDateString()
    )

    if (existing) {
      return res.status(409).json({ 
        success: false, 
        message: 'Attendance already marked for today',
        record: existing
      })
    }

    // Mark attendance
    const attendanceRecord = {
      id: `att_${Date.now()}`,
      studentId,
      classId: qrData.classId,
      className: qrData.className,
      method,
      timestamp: new Date(),
      date: new Date().toDateString(),
      location: qrData.location,
      status: 'present'
    }

    attendanceRecords.push(attendanceRecord)

    // Update class stats
    classInfo.presentStudents += 1

    res.json({
      success: true,
      message: 'Attendance marked successfully!',
      record: attendanceRecord,
      classInfo: {
        name: classInfo.name,
        location: classInfo.location,
        presentCount: classInfo.presentStudents,
        totalCount: classInfo.expectedStudents,
        attendanceRate: Math.round((classInfo.presentStudents / classInfo.expectedStudents) * 100)
      }
    })

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    })
  }
})

// Get attendance records
router.get('/records/:studentId', (req, res) => {
  const { studentId } = req.params
  const records = attendanceRecords.filter(r => r.studentId === studentId)
  res.json({ success: true, records })
})

// Get class attendance
router.get('/class/:classId', (req, res) => {
  const { classId } = req.params
  const records = attendanceRecords.filter(r => r.classId === classId)
  const classInfo = activeClasses.find(c => c.id === classId)
  
  res.json({ 
    success: true, 
    records,
    classInfo
  })
})

export default router
