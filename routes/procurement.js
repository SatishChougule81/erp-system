const express = require('express');
const { db } = require('../database');

const router = express.Router();

// Generate request number
function generateRequestNumber() {
  return 'REQ-' + Date.now();
}

// Get all procurement requests
router.get('/', (req, res) => {
  db.all(`SELECT * FROM procurementWorkflows ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get request with approvals
router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM procurementWorkflows WHERE id = ?`, [req.params.id], (err, workflow) => {
    if (err || !workflow) return res.status(404).json({ error: 'Request not found' });
    
    db.all(`SELECT * FROM approvals WHERE procurementId = ? ORDER BY approverLevel ASC`, [req.params.id], (err2, approvals) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ ...workflow, approvals });
    });
  });
});

// Create procurement request
router.post('/', (req, res) => {
  const { requesterDepartment, description, estimatedBudget, approvalChain, createdBy } = req.body;
  
  if (!requesterDepartment || !description || !approvalChain) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const requestNumber = generateRequestNumber();
  const approverLevels = approvalChain.split(',');
  const currentApprover = approverLevels[0];

  db.run(
    `INSERT INTO procurementWorkflows (requestNumber, requesterDepartment, description, estimatedBudget, approvalChain, currentApprover, createdBy, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [requestNumber, requesterDepartment, description, estimatedBudget || 0, approvalChain, currentApprover, createdBy || 'system', 'draft'],
    function(err) {
      if (err) return res.status(400).json({ error: err.message });
      
      const workflowId = this.lastID;
      
      // Create approval entries
      approverLevels.forEach((approver, index) => {
        db.run(
          `INSERT INTO approvals (procurementId, approverLevel, approverName, status)
           VALUES (?, ?, ?, ?)`,
          [workflowId, 'Level' + (index + 1), approver.trim(), 'pending'],
          (err) => {
            if (err) console.error(err);
          }
        );
      });
      
      res.json({ message: 'Request created', requestNumber, requestId: workflowId });
    }
  );
});

// Submit request for approval
router.patch('/:id/submit', (req, res) => {
  db.run(
    `UPDATE procurementWorkflows SET status = ?, submittedAt = CURRENT_TIMESTAMP WHERE id = ?`,
    ['pending-approval', req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Request submitted for approval' });
    }
  );
});

// Approve request
router.patch('/:id/approve', (req, res) => {
  const { approverName, comments } = req.body;
  
  if (!approverName) return res.status(400).json({ error: 'Approver name required' });
  
  // Update approval record
  db.run(
    `UPDATE approvals SET status = ?, comments = ? WHERE procurementId = ? AND approverName = ?`,
    ['approved', comments || '', req.params.id, approverName],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Check if all approvals are done
      db.all(
        `SELECT * FROM approvals WHERE procurementId = ?`,
        [req.params.id],
        (err2, approvals) => {
          const allApproved = approvals.every(a => a.status === 'approved');
          
          if (allApproved) {
            db.run(
              `UPDATE procurementWorkflows SET status = ?, completedAt = CURRENT_TIMESTAMP WHERE id = ?`,
              ['approved', req.params.id],
              (err3) => {
                if (err3) return res.status(500).json({ error: err3.message });
                res.json({ message: 'Request approved and completed' });
              }
            );
          } else {
            // Move to next approver
            const nextPendingApproval = approvals.find(a => a.status === 'pending');
            if (nextPendingApproval) {
              db.run(
                `UPDATE procurementWorkflows SET currentApprover = ? WHERE id = ?`,
                [nextPendingApproval.approverName, req.params.id],
                (err3) => {
                  if (err3) return res.status(500).json({ error: err3.message });
                  res.json({ message: 'Approved, forwarded to next approver' });
                }
              );
            }
          }
        }
      );
    }
  );
});

// Reject request
router.patch('/:id/reject', (req, res) => {
  const { approverName, comments } = req.body;
  
  db.run(
    `UPDATE approvals SET status = ?, comments = ? WHERE procurementId = ? AND approverName = ?`,
    ['rejected', comments || '', req.params.id, approverName],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      
      db.run(
        `UPDATE procurementWorkflows SET status = ? WHERE id = ?`,
        ['rejected', req.params.id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ message: 'Request rejected' });
        }
      );
    }
  );
});

// Get requests by status
router.get('/status/:status', (req, res) => {
  db.all(`SELECT * FROM procurementWorkflows WHERE status = ? ORDER BY createdAt DESC`, [req.params.status], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
