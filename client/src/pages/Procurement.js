import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Procurement({ token }) {
  const [requests, setRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ requesterDepartment: '', description: '', estimatedBudget: 0, approvalChain: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/api/procurement', { headers: { Authorization: `Bearer ${token}` } });
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/procurement', { ...formData, createdBy: 'user' }, { headers: { Authorization: `Bearer ${token}` } });
      setFormData({ requesterDepartment: '', description: '', estimatedBudget: 0, approvalChain: '' });
      setShowForm(false);
      fetchRequests();
      alert('Request created');
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating request');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Procurement Requests</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Request</button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Department</label><input type="text" className="form-input" value={formData.requesterDepartment} onChange={(e) => setFormData(prev => ({ ...prev, requesterDepartment: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Estimated Budget</label><input type="number" className="form-input" value={formData.estimatedBudget} onChange={(e) => setFormData(prev => ({ ...prev, estimatedBudget: parseFloat(e.target.value) }))} step="0.01" /></div>
              <div className="form-group"><label className="form-label">Approval Chain (comma separated)</label><input type="text" className="form-input" value={formData.approvalChain} onChange={(e) => setFormData(prev => ({ ...prev, approvalChain: e.target.value }))} placeholder="Manager, Director, CFO" required /></div>
            </div>
            <button type="submit" className="btn btn-primary">Create Request</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead><tr><th>Request#</th><th>Department</th><th>Budget</th><th>Status</th><th>Created</th></tr></thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td><strong>{req.requestNumber}</strong></td>
                <td>{req.requesterDepartment}</td>
                <td>₹{req.estimatedBudget?.toLocaleString('en-IN')}</td>
                <td><span className={`table-status status-${req.status}`}>{req.status}</span></td>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Procurement;
