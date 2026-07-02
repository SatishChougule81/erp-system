const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Get all employees
router.get('/', (req, res) => {
  db.all(`SELECT * FROM employees ORDER BY firstName ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get single employee
router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM employees WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Employee not found' });
    res.json(row);
  });
});

// Create employee
router.post('/', (req, res) => {
  const { employeeId, firstName, lastName, email, phone, department, position, salary, joinDate, status } = req.body;
  
  if (!employeeId || !firstName || !lastName || !email || !department || !position) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO employees (employeeId, firstName, lastName, email, phone, department, position, salary, joinDate, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [employeeId, firstName, lastName, email, phone || '', department, position, salary || 0, joinDate, status || 'active'],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Employee created', employeeId: this.lastID });
    }
  );
});

// Update employee
router.put('/:id', (req, res) => {
  const { firstName, lastName, email, phone, department, position, salary, status } = req.body;
  
  db.run(
    `UPDATE employees SET firstName=?, lastName=?, email=?, phone=?, department=?, position=?, salary=?, status=?
     WHERE id=?`,
    [firstName, lastName, email, phone, department, position, salary, status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Employee updated' });
    }
  );
});

// Delete employee
router.delete('/:id', (req, res) => {
  db.run(`DELETE FROM employees WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee deleted' });
  });
});

// Search employees
router.get('/search/:query', (req, res) => {
  const query = `%${req.params.query}%`;
  db.all(
    `SELECT * FROM employees WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? ORDER BY firstName ASC`,
    [query, query, query],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
