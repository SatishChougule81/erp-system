import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Employees({ token }) {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: 0,
    joinDate: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await axios.put(`/api/employees/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Employee updated successfully');
      } else {
        await axios.post('/api/employees', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Employee created successfully');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        employeeId: '', firstName: '', lastName: '', email: '', phone: '',
        department: '', position: '', salary: 0, joinDate: '', status: 'active'
      });
      fetchEmployees();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving employee');
    }
  };

  const handleEdit = (employee) => {
    setFormData(employee);
    setEditingId(employee.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchEmployees();
        alert('Employee deleted');
      } catch (error) {
        alert('Error deleting employee');
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchEmployees();
      return;
    }

    try {
      const response = await axios.get(`/api/employees/search/${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  if (loading) return <div className="loading">Loading employees...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Employee Management</h1>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ employeeId: '', firstName: '', lastName: '', email: '', phone: '', department: '', position: '', salary: 0, joinDate: '', status: 'active' }); }}>
          {showForm ? 'Cancel' : '+ Add Employee'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 className="card-title">{editingId ? 'Edit Employee' : 'New Employee'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Employee ID</label>
                <input type="text" name="employeeId" className="form-input" value={formData.employeeId} onChange={handleChange} required disabled={editingId} />
              </div>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" name="firstName" className="form-input" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" name="lastName" className="form-input" value={formData.lastName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" name="phone" className="form-input" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input type="text" name="department" className="form-input" value={formData.department} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Position</label>
                <input type="text" name="position" className="form-input" value={formData.position} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Salary</label>
                <input type="number" name="salary" className="form-input" value={formData.salary} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Join Date</label>
                <input type="date" name="joinDate" className="form-input" value={formData.joinDate} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? 'Update' : 'Create'} Employee</button>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-secondary" onClick={handleSearch}>Search</button>
          <button className="btn btn-secondary" onClick={() => { setSearchQuery(''); fetchEmployees(); }}>Clear</button>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td><strong>{emp.employeeId}</strong></td>
                <td>{emp.firstName} {emp.lastName}</td>
                <td>{emp.email}</td>
                <td>{emp.department}</td>
                <td>{emp.position}</td>
                <td><span className="table-status" style={{ background: emp.status === 'active' ? '#dcfce7' : '#fee2e2', color: emp.status === 'active' ? '#166534' : '#991b1b' }}>{emp.status}</span></td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary btn-small" onClick={() => handleEdit(emp)}>Edit</button>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(emp.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employees;
