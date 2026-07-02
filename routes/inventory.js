const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Get all inventory items
router.get('/', (req, res) => {
  db.all(`SELECT * FROM inventory ORDER BY itemName ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get inventory summary
router.get('/summary', (req, res) => {
  db.all(
    `SELECT 
      COUNT(*) as totalItems,
      SUM(quantity) as totalQuantity,
      SUM(quantity * unitPrice) as totalValue,
      SUM(CASE WHEN quantity < minQuantity THEN 1 ELSE 0 END) as lowStockItems
     FROM inventory`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows[0]);
    }
  );
});

// Get single item
router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM inventory WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Item not found' });
    res.json(row);
  });
});

// Create inventory item
router.post('/', (req, res) => {
  const { itemCode, itemName, category, quantity, minQuantity, unitPrice, reorderLevel, warehouseLocation, supplier } = req.body;
  
  if (!itemCode || !itemName || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO inventory (itemCode, itemName, category, quantity, minQuantity, unitPrice, reorderLevel, warehouseLocation, supplier)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [itemCode, itemName, category, quantity || 0, minQuantity || 10, unitPrice || 0, reorderLevel || 20, warehouseLocation || '', supplier || ''],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Item created', itemId: this.lastID });
    }
  );
});

// Update inventory item
router.put('/:id', (req, res) => {
  const { itemName, category, quantity, minQuantity, unitPrice, reorderLevel, warehouseLocation, supplier } = req.body;
  
  db.run(
    `UPDATE inventory SET itemName=?, category=?, quantity=?, minQuantity=?, unitPrice=?, reorderLevel=?, warehouseLocation=?, supplier=?, lastUpdated=CURRENT_TIMESTAMP
     WHERE id=?`,
    [itemName, category, quantity, minQuantity, unitPrice, reorderLevel, warehouseLocation, supplier, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item updated' });
    }
  );
});

// Update stock quantity
router.patch('/:id/stock', (req, res) => {
  const { quantity } = req.body;
  
  db.run(
    `UPDATE inventory SET quantity=?, lastUpdated=CURRENT_TIMESTAMP WHERE id=?`,
    [quantity, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Stock updated' });
    }
  );
});

// Get low stock items
router.get('/alerts/low-stock', (req, res) => {
  db.all(`SELECT * FROM inventory WHERE quantity < minQuantity ORDER BY quantity ASC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Delete item
router.delete('/:id', (req, res) => {
  db.run(`DELETE FROM inventory WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Item deleted' });
  });
});

module.exports = router;
