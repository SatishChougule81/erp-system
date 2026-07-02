const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Get dashboard overview
router.get('/overview', (req, res) => {
  const overview = {};
  let completedQueries = 0;
  const totalQueries = 6;

  // Total employees
  db.get(`SELECT COUNT(*) as count FROM employees WHERE status = 'active'`, (err, row) => {
    overview.totalEmployees = row?.count || 0;
    completedQueries++;
    if (completedQueries === totalQueries) res.json(overview);
  });

  // Total inventory value
  db.get(`SELECT SUM(quantity * unitPrice) as value FROM inventory`, (err, row) => {
    overview.inventoryValue = row?.value || 0;
    completedQueries++;
    if (completedQueries === totalQueries) res.json(overview);
  });

  // Pending POs
  db.get(`SELECT COUNT(*) as count FROM purchaseOrders WHERE status = 'pending'`, (err, row) => {
    overview.pendingPOs = row?.count || 0;
    completedQueries++;
    if (completedQueries === totalQueries) res.json(overview);
  });

  // Low stock items
  db.get(`SELECT COUNT(*) as count FROM inventory WHERE quantity < minQuantity`, (err, row) => {
    overview.lowStockItems = row?.count || 0;
    completedQueries++;
    if (completedQueries === totalQueries) res.json(overview);
  });

  // Pending approvals
  db.get(`SELECT COUNT(*) as count FROM procurementWorkflows WHERE status = 'pending-approval'`, (err, row) => {
    overview.pendingApprovals = row?.count || 0;
    completedQueries++;
    if (completedQueries === totalQueries) res.json(overview);
  });

  // Today's attendance
  const today = new Date().toISOString().split('T')[0];
  db.get(
    `SELECT COUNT(*) as count FROM attendance WHERE attendanceDate = ? AND status = 'present'`,
    [today],
    (err, row) => {
      overview.presentToday = row?.count || 0;
      completedQueries++;
      if (completedQueries === totalQueries) res.json(overview);
    }
  );
});

// Get employee statistics
router.get('/employees', (req, res) => {
  db.all(
    `SELECT 
      department,
      COUNT(*) as count,
      AVG(salary) as avgSalary
     FROM employees
     WHERE status = 'active'
     GROUP BY department`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get inventory trends
router.get('/inventory-trends', (req, res) => {
  db.all(
    `SELECT 
      category,
      COUNT(*) as itemCount,
      SUM(quantity) as totalQuantity,
      SUM(quantity * unitPrice) as totalValue
     FROM inventory
     GROUP BY category`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get monthly payroll summary
router.get('/payroll-summary/:year', (req, res) => {
  db.all(
    `SELECT 
      month,
      COUNT(*) as employeeCount,
      SUM(baseSalary) as totalBaseSalary,
      SUM(netSalary) as totalNetSalary
     FROM payroll
     WHERE year = ?
     GROUP BY month
     ORDER BY month ASC`,
    [req.params.year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get PO statistics
router.get('/po-statistics', (req, res) => {
  db.all(
    `SELECT 
      status,
      COUNT(*) as count,
      SUM(totalAmount) as totalAmount
     FROM purchaseOrders
     GROUP BY status`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get attendance summary
router.get('/attendance/:month/:year', (req, res) => {
  db.all(
    `SELECT 
      status,
      COUNT(*) as count
     FROM attendance
     WHERE strftime('%m', attendanceDate) = ? AND strftime('%Y', attendanceDate) = ?
     GROUP BY status`,
    [req.params.month.padStart(2, '0'), req.params.year],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

module.exports = router;
