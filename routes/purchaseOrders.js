const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Generate PO Number
function generatePONumber() {
  return 'PO-' + Date.now();
}

// Get all POs
router.get('/', (req, res) => {
  db.all(`SELECT * FROM purchaseOrders ORDER BY orderDate DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get PO with items
router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM purchaseOrders WHERE id = ?`, [req.params.id], (err, po) => {
    if (err || !po) return res.status(404).json({ error: 'PO not found' });
    
    db.all(`SELECT * FROM poItems WHERE poId = ?`, [req.params.id], (err2, items) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ ...po, items });
    });
  });
});

// Create PO
router.post('/', (req, res) => {
  const { supplier, orderDate, expectedDelivery, items, notes, createdBy } = req.body;
  
  if (!supplier || !orderDate || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const poNumber = generatePONumber();
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  db.run(
    `INSERT INTO purchaseOrders (poNumber, supplier, orderDate, expectedDelivery, totalAmount, notes, createdBy, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [poNumber, supplier, orderDate, expectedDelivery || null, totalAmount, notes || '', createdBy || 'system', 'pending'],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      
      const poId = this.lastID;
      let insertedCount = 0;

      items.forEach(item => {
        db.run(
          `INSERT INTO poItems (poId, itemCode, itemName, quantity, unitPrice, totalPrice)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [poId, item.itemCode, item.itemName, item.quantity, item.unitPrice, item.totalPrice],
          (err) => {
            if (err) console.error(err);
            insertedCount++;
            if (insertedCount === items.length) {
              res.json({ message: 'PO created', poNumber, poId });
            }
          }
        );
      });
    }
  );
});

// Update PO status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  
  db.run(
    `UPDATE purchaseOrders SET status = ? WHERE id = ?`,
    [status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'PO status updated' });
    }
  );
});

// Get PO by status
router.get('/status/:status', (req, res) => {
  db.all(`SELECT * FROM purchaseOrders WHERE status = ? ORDER BY orderDate DESC`, [req.params.status], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Delete PO
router.delete('/:id', (req, res) => {
  db.run(`DELETE FROM poItems WHERE poId = ?`, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.run(`DELETE FROM purchaseOrders WHERE id = ?`, [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'PO deleted' });
    });
  });
});

module.exports = router;
