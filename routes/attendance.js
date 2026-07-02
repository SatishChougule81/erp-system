const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Get attendance by date range
router.get('/employee/:employeeId', (req, res) => {
  const { startDate, endDate } = req.query;
  
  let query = `SELECT * FROM attendance WHERE employeeId = ?`;
  let params = [req.params.employeeId];
  
  if (startDate && endDate) {
    query += ` AND attendanceDate BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  
  query += ` ORDER BY attendanceDate DESC`;
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Check-in employee
router.post('/check-in', (req, res) => {
  const { employeeId, checkInTime } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  if (!employeeId) return res.status(400).json({ error: 'Employee ID required' });
  
  db.get(
    `SELECT * FROM attendance WHERE employeeId = ? AND attendanceDate = ?`,
    [employeeId, today],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      
      if (row) {
        // Update existing record
        db.run(
          `UPDATE attendance SET checkIn = ?, status = 'present' WHERE employeeId = ? AND attendanceDate = ?`,
          [checkInTime || new Date().toLocaleTimeString(), employeeId, today],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Checked in' });
          }
        );
      } else {
        // Create new record
        db.run(
          `INSERT INTO attendance (employeeId, attendanceDate, checkIn, status)
           VALUES (?, ?, ?, ?)`,
          [employeeId, today, checkInTime || new Date().toLocaleTimeString(), 'present'],
          (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Checked in' });
          }
        );
      }
    }
  );
});

// Check-out employee
router.post('/check-out', (req, res) => {
  const { employeeId, checkOutTime } = req.body;
  const today = new Date().toISOString().split('T')[0];
  
  if (!employeeId) return res.status(400).json({ error: 'Employee ID required' });
  
  db.run(
    `UPDATE attendance SET checkOut = ? WHERE employeeId = ? AND attendanceDate = ?`,
    [checkOutTime || new Date().toLocaleTimeString(), employeeId, today],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Checked out' });
    }
  );
});

// Mark attendance manually
router.post('/mark', (req, res) => {
  const { employeeId, attendanceDate, status, remarks } = req.body;
  
  if (!employeeId || !attendanceDate || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  db.run(
    `INSERT OR REPLACE INTO attendance (employeeId, attendanceDate, status, remarks)
     VALUES (?, ?, ?, ?)`,
    [employeeId, attendanceDate, status, remarks || ''],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Attendance marked' });
    }
  );
});

// Get attendance summary
router.get('/summary/:month/:year', (req, res) => {
  const { month, year } = req.params;
  
  db.all(
    `SELECT 
      employeeId,
      COUNT(CASE WHEN status = 'present' THEN 1 END) as presentDays,
      COUNT(CASE WHEN status = 'absent' THEN 1 END) as absentDays,
      COUNT(CASE WHEN status = 'leave' THEN 1 END) as leaveDays
     FROM attendance
     WHERE strftime('%m', attendanceDate) = ? AND strftime('%Y', attendanceDate) = ?
     GROUP BY employeeId`,
    [month.padStart(2, '0'), year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
