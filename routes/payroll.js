const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Get payroll for employee
router.get('/employee/:employeeId', (req, res) => {
  db.all(
    `SELECT * FROM payroll WHERE employeeId = ? ORDER BY year DESC, month DESC`,
    [req.params.employeeId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get payroll for specific period
router.get('/:month/:year', (req, res) => {
  db.all(
    `SELECT p.*, e.firstName, e.lastName, e.position FROM payroll p
     JOIN employees e ON p.employeeId = e.employeeId
     WHERE p.month = ? AND p.year = ?
     ORDER BY e.firstName ASC`,
    [req.params.month, req.params.year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Create/update payroll
router.post('/', (req, res) => {
  const { employeeId, month, year, baseSalary, allowances, deductions, netSalary, status } = req.body;
  
  if (!employeeId || !month || !year || baseSalary === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const net = baseSalary + (allowances || 0) - (deductions || 0);

  db.run(
    `INSERT OR REPLACE INTO payroll (employeeId, month, year, baseSalary, allowances, deductions, netSalary, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [employeeId, month, year, baseSalary, allowances || 0, deductions || 0, netSalary || net, status || 'draft'],
    (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Payroll saved' });
    }
  );
});

// Process payroll (bulk)
router.post('/process/bulk', (req, res) => {
  const { month, year, payrolls } = req.body;
  
  if (!month || !year || !payrolls || payrolls.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let processedCount = 0;

  payrolls.forEach(payroll => {
    db.run(
      `UPDATE payroll SET status = ?, processedDate = CURRENT_TIMESTAMP
       WHERE employeeId = ? AND month = ? AND year = ?`,
      ['processed', payroll.employeeId, month, year],
      (err) => {
        if (err) console.error(err);
        processedCount++;
        if (processedCount === payrolls.length) {
          res.json({ message: 'Payroll processed for ' + payrolls.length + ' employees' });
        }
      }
    );
  });
});

// Update payroll status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  
  db.run(
    `UPDATE payroll SET status = ? WHERE id = ?`,
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Status updated' });
    }
  );
});

// Get payroll summary
router.get('/summary/:month/:year', (req, res) => {
  db.get(
    `SELECT 
      COUNT(*) as totalEmployees,
      SUM(baseSalary) as totalBaseSalary,
      SUM(allowances) as totalAllowances,
      SUM(deductions) as totalDeductions,
      SUM(netSalary) as totalNetSalary
     FROM payroll
     WHERE month = ? AND year = ?`,
    [req.params.month, req.params.year],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row);
    }
  );
});

module.exports = router;
