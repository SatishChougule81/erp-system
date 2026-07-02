const { db, initializeDatabase } = require('./database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Seed demo user
    const hashedPassword = bcrypt.hashSync('demo123', 10);
    db.run(
      `INSERT OR IGNORE INTO users (username, email, password, fullName, department, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['demo', 'demo@example.com', hashedPassword, 'Demo Admin', 'Admin', 'admin']
    );

    // Seed employees
    const employees = [
      ['EMP001', 'Rajesh', 'Kumar', 'rajesh@company.com', '9876543210', 'HR', 'Manager', 50000, '2023-01-15', 'active'],
      ['EMP002', 'Priya', 'Singh', 'priya@company.com', '9876543211', 'Finance', 'Accountant', 40000, '2023-02-10', 'active'],
      ['EMP003', 'Amit', 'Patel', 'amit@company.com', '9876543212', 'Sales', 'Executive', 35000, '2023-03-20', 'active'],
      ['EMP004', 'Neha', 'Sharma', 'neha@company.com', '9876543213', 'IT', 'Developer', 45000, '2023-01-05', 'active'],
      ['EMP005', 'Arjun', 'Nair', 'arjun@company.com', '9876543214', 'Operations', 'Supervisor', 38000, '2023-04-01', 'active'],
      ['EMP006', 'Meera', 'Gupta', 'meera@company.com', '9876543215', 'HR', 'Specialist', 35000, '2023-05-10', 'active'],
      ['EMP007', 'Vikram', 'Reddy', 'vikram@company.com', '9876543216', 'Finance', 'Analyst', 42000, '2023-03-15', 'active'],
      ['EMP008', 'Sneha', 'Joshi', 'sneha@company.com', '9876543217', 'Sales', 'Manager', 55000, '2023-02-01', 'active']
    ];

    employees.forEach(emp => {
      db.run(
        `INSERT OR IGNORE INTO employees (employeeId, firstName, lastName, email, phone, department, position, salary, joinDate, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        emp
      );
    });

    // Seed inventory items
    const items = [
      ['IT001', 'Laptop', 'Electronics', 15, 5, 50000, 10, 'Warehouse A', 'Dell Inc'],
      ['IT002', 'Monitor', 'Electronics', 30, 10, 15000, 15, 'Warehouse A', 'LG Electronics'],
      ['OF001', 'Office Chair', 'Furniture', 50, 20, 5000, 25, 'Warehouse B', 'Comfort Seating'],
      ['OF002', 'Desk', 'Furniture', 25, 10, 8000, 15, 'Warehouse B', 'Modern Furniture Co'],
      ['ST001', 'Printer Paper', 'Stationery', 200, 50, 250, 100, 'Store A', 'Paper Mill Ltd'],
      ['ST002', 'Pens (Box)', 'Stationery', 100, 20, 150, 50, 'Store A', 'Writing Inc'],
      ['HW001', 'USB Cable', 'Hardware', 150, 30, 200, 75, 'Warehouse C', 'Tech Supplies'],
      ['HW002', 'Network Switch', 'Hardware', 5, 2, 15000, 3, 'Warehouse C', 'Cisco Systems']
    ];

    items.forEach(item => {
      db.run(
        `INSERT OR IGNORE INTO inventory (itemCode, itemName, category, quantity, minQuantity, unitPrice, reorderLevel, warehouseLocation, supplier)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        item
      );
    });

    // Seed purchase orders
    const today = new Date();
    const poData = [
      ['Supplier A', today.toISOString().split('T')[0], new Date(today.getTime() + 7*24*60*60*1000).toISOString().split('T')[0], 'pending', 250000, 'Laptops and monitors for new hires', 'demo'],
      ['Supplier B', today.toISOString().split('T')[0], new Date(today.getTime() + 10*24*60*60*1000).toISOString().split('T')[0], 'received', 50000, 'Office furniture', 'demo'],
      ['Supplier C', today.toISOString().split('T')[0], new Date(today.getTime() + 5*24*60*60*1000).toISOString().split('T')[0], 'pending', 15000, 'Stationery supplies', 'demo']
    ];

    let poCount = 0;
    poData.forEach((poInfo, idx) => {
      const poNumber = 'PO-' + Date.now() + idx;
      db.run(
        `INSERT INTO purchaseOrders (poNumber, supplier, orderDate, expectedDelivery, status, totalAmount, notes, createdBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [poNumber, ...poInfo],
        function(err) {
          if (!err) {
            // Add PO items
            const poItems = [
              [this.lastID, 'IT001', 'Laptop', 3, 50000],
              [this.lastID, 'IT002', 'Monitor', 5, 15000]
            ];
            poItems.forEach(item => {
              db.run(
                `INSERT INTO poItems (poId, itemCode, itemName, quantity, unitPrice, totalPrice)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [...item, item[3] * item[4]]
              );
            });
          }
          poCount++;
        }
      );
    });

    // Seed payroll
    employees.forEach(emp => {
      for (let month = 1; month <= 3; month++) {
        const baseSalary = emp[7];
        const allowances = baseSalary * 0.15;
        const deductions = baseSalary * 0.05;
        const netSalary = baseSalary + allowances - deductions;

        db.run(
          `INSERT OR IGNORE INTO payroll (employeeId, month, year, baseSalary, allowances, deductions, netSalary, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [emp[0], month, 2024, baseSalary, allowances, deductions, netSalary, 'processed']
        );
      }
    });

    // Seed attendance
    employees.forEach(emp => {
      for (let day = 1; day <= 20; day++) {
        const status = Math.random() > 0.1 ? 'present' : 'absent';
        const date = new Date(2024, 0, day).toISOString().split('T')[0];
        db.run(
          `INSERT OR IGNORE INTO attendance (employeeId, attendanceDate, status)
           VALUES (?, ?, ?)`,
          [emp[0], date, status]
        );
      }
    });

    console.log('✅ Demo data seeded successfully!');
    console.log('📧 Login with: demo@example.com / demo123');
    
    setTimeout(() => {
      db.close();
      process.exit(0);
    }, 1000);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
