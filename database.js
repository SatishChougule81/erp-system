const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'erp.db');
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users Table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          fullName TEXT NOT NULL,
          role TEXT DEFAULT 'staff',
          department TEXT,
          active INTEGER DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Employees Table
      db.run(`
        CREATE TABLE IF NOT EXISTS employees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employeeId TEXT UNIQUE NOT NULL,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          department TEXT NOT NULL,
          position TEXT NOT NULL,
          salary REAL DEFAULT 0,
          joinDate DATE NOT NULL,
          status TEXT DEFAULT 'active',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Inventory Table
      db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          itemCode TEXT UNIQUE NOT NULL,
          itemName TEXT NOT NULL,
          category TEXT NOT NULL,
          quantity INTEGER DEFAULT 0,
          minQuantity INTEGER DEFAULT 10,
          unitPrice REAL DEFAULT 0,
          reorderLevel INTEGER DEFAULT 20,
          warehouseLocation TEXT,
          supplier TEXT,
          lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Purchase Orders Table
      db.run(`
        CREATE TABLE IF NOT EXISTS purchaseOrders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          poNumber TEXT UNIQUE NOT NULL,
          supplier TEXT NOT NULL,
          orderDate DATE NOT NULL,
          expectedDelivery DATE,
          status TEXT DEFAULT 'pending',
          totalAmount REAL DEFAULT 0,
          notes TEXT,
          createdBy TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // PO Items Table
      db.run(`
        CREATE TABLE IF NOT EXISTS poItems (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          poId INTEGER NOT NULL,
          itemCode TEXT NOT NULL,
          itemName TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unitPrice REAL NOT NULL,
          totalPrice REAL NOT NULL,
          FOREIGN KEY (poId) REFERENCES purchaseOrders(id)
        )
      `);

      // Attendance Table
      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employeeId TEXT NOT NULL,
          attendanceDate DATE NOT NULL,
          checkIn TIME,
          checkOut TIME,
          status TEXT DEFAULT 'absent',
          remarks TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(employeeId, attendanceDate)
        )
      `);

      // Payroll Table
      db.run(`
        CREATE TABLE IF NOT EXISTS payroll (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          employeeId TEXT NOT NULL,
          month INTEGER NOT NULL,
          year INTEGER NOT NULL,
          baseSalary REAL DEFAULT 0,
          allowances REAL DEFAULT 0,
          deductions REAL DEFAULT 0,
          netSalary REAL DEFAULT 0,
          status TEXT DEFAULT 'draft',
          processedDate DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(employeeId, month, year)
        )
      `);

      // Procurement Workflows Table
      db.run(`
        CREATE TABLE IF NOT EXISTS procurementWorkflows (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          requestNumber TEXT UNIQUE NOT NULL,
          requesterDepartment TEXT NOT NULL,
          description TEXT NOT NULL,
          estimatedBudget REAL DEFAULT 0,
          status TEXT DEFAULT 'draft',
          approvalChain TEXT,
          currentApprover TEXT,
          createdBy TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          submittedAt DATETIME,
          completedAt DATETIME
        )
      `);

      // Approvals Table
      db.run(`
        CREATE TABLE IF NOT EXISTS approvals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          procurementId INTEGER NOT NULL,
          approverLevel TEXT NOT NULL,
          approverName TEXT NOT NULL,
          status TEXT DEFAULT 'pending',
          comments TEXT,
          approvedAt DATETIME,
          FOREIGN KEY (procurementId) REFERENCES procurementWorkflows(id)
        )
      `);

      // Notifications Table
      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT NOT NULL,
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          relatedId INTEGER,
          read INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Dashboard Metrics Table
      db.run(`
        CREATE TABLE IF NOT EXISTS dashboardMetrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          metricType TEXT NOT NULL,
          metricValue REAL DEFAULT 0,
          metricDate DATE DEFAULT CURRENT_DATE,
          details TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(metricType, metricDate)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    });
  });
}

module.exports = { db, initializeDatabase };
