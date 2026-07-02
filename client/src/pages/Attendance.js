// Attendance.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Attendance({ token }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ employeeId: '', attendanceDate: new Date().toISOString().split('T')[0], status: 'present' });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchAttendanceSummary();
  }, [token, month, year]);

  const fetchAttendanceSummary = async () => {
    try {
      const response = await axios.get(`/api/attendance/summary/${month}/${year}`, { headers: { Authorization: `Bearer ${token}` } });
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/attendance/mark', formData, { headers: { Authorization: `Bearer ${token}` } });
      setFormData({ employeeId: '', attendanceDate: new Date().toISOString().split('T')[0], status: 'present' });
      fetchAttendanceSummary();
      alert('Attendance marked');
    } catch (error) {
      alert(error.response?.data?.error || 'Error marking attendance');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1>Attendance Management</h1>

      <div className="card">
        <h3 className="card-title">Mark Attendance</h3>
        <form onSubmit={handleMarkAttendance}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Employee ID</label>
              <input type="text" className="form-input" value={formData.employeeId} onChange={(e) => setFormData(prev => ({ ...prev, employeeId: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={formData.attendanceDate} onChange={(e) => setFormData(prev => ({ ...prev, attendanceDate: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="half-day">Half Day</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Mark Attendance</button>
        </form>
      </div>

      <div className="card">
        <h3 className="card-title">Attendance Summary - {month}/{year}</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select className="form-select" style={{ width: '150px' }} value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="form-select" style={{ width: '150px' }} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="grid grid-4">
          {summary && summary.map((item, idx) => (
            <div key={idx} className="metric-card">
              <div className="metric-label">{item.employeeId}</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                <div>Present: {item.presentDays}</div>
                <div>Absent: {item.absentDays}</div>
                <div>Leave: {item.leaveDays}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Payroll.js
function Payroll({ token }) {
  const [payrollData, setPayrollData] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, [token, month, year]);

  const fetchPayroll = async () => {
    try {
      const [dataRes, summaryRes] = await Promise.all([
        axios.get(`/api/payroll/${month}/${year}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/payroll/summary/${month}/${year}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPayrollData(dataRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Failed to fetch payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <h1>Payroll Management</h1>

      {summary && (
        <div className="grid grid-4" style={{ marginBottom: '1.5rem' }}>
          <div className="metric-card"><div className="metric-label">Total Employees</div><div className="metric-value">{summary.totalEmployees || 0}</div></div>
          <div className="metric-card"><div className="metric-label">Total Base Salary</div><div className="metric-value">₹{(summary.totalBaseSalary || 0).toLocaleString('en-IN')}</div></div>
          <div className="metric-card"><div className="metric-label">Total Deductions</div><div className="metric-value">₹{(summary.totalDeductions || 0).toLocaleString('en-IN')}</div></div>
          <div className="metric-card"><div className="metric-label">Total Net Salary</div><div className="metric-value">₹{(summary.totalNetSalary || 0).toLocaleString('en-IN')}</div></div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select className="form-select" style={{ width: '150px' }} value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="form-select" style={{ width: '150px' }} value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <table className="table">
          <thead><tr><th>Employee</th><th>Position</th><th>Base Salary</th><th>Allowances</th><th>Deductions</th><th>Net Salary</th><th>Status</th></tr></thead>
          <tbody>
            {payrollData.map(payroll => (
              <tr key={payroll.id}>
                <td><strong>{payroll.firstName} {payroll.lastName}</strong></td>
                <td>{payroll.position}</td>
                <td>₹{payroll.baseSalary?.toLocaleString('en-IN')}</td>
                <td>₹{payroll.allowances?.toLocaleString('en-IN')}</td>
                <td>₹{payroll.deductions?.toLocaleString('en-IN')}</td>
                <td>₹{payroll.netSalary?.toLocaleString('en-IN')}</td>
                <td><span className={`table-status status-${payroll.status}`}>{payroll.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Procurement.js
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

export { Attendance, Payroll, Procurement };
export default Attendance;
