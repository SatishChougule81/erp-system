const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Get notifications for user
router.get('/user/:userId', (req, res) => {
  const { unreadOnly } = req.query;
  
  let query = `SELECT * FROM notifications WHERE userId = ?`;
  let params = [req.params.userId];
  
  if (unreadOnly === 'true') {
    query += ` AND read = 0`;
  }
  
  query += ` ORDER BY createdAt DESC LIMIT 50`;
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get unread count
router.get('/user/:userId/unread-count', (req, res) => {
  db.get(
    `SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND read = 0`,
    [req.params.userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ unreadCount: row.count });
    }
  );
});

// Create notification
router.post('/', (req, res) => {
  const { userId, type, title, message, relatedId } = req.body;
  
  if (!userId || !type || !title || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO notifications (userId, type, title, message, relatedId)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, type, title, message, relatedId || null],
    (err) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ message: 'Notification created' });
    }
  );
});

// Mark as read
router.patch('/:id/read', (req, res) => {
  db.run(
    `UPDATE notifications SET read = 1 WHERE id = ?`,
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Marked as read' });
    }
  );
});

// Mark all as read for user
router.patch('/user/:userId/read-all', (req, res) => {
  db.run(
    `UPDATE notifications SET read = 1 WHERE userId = ?`,
    [req.params.userId],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'All marked as read' });
    }
  );
});

// Delete notification
router.delete('/:id', (req, res) => {
  db.run(
    `DELETE FROM notifications WHERE id = ?`,
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Notification deleted' });
    }
  );
});

module.exports = router;
