import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard({ token }) {
  const [overview, setOverview] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, empRes, invRes, payrollRes] = await Promise.all([
        axios.get('/api/dashboard/overview', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/dashboard/employees', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/dashboard/inventory-trends', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/dashboard/payroll-summary/${new Date().getFullYear()}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setOverview(overviewRes.data);
      setEmployees(empRes.data);
      setInventory(invRes.data);
      setPayrollData(payrollRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>

      {/* Key Metrics */}
      <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="metric-card">
          <div className="metric-label">Total Employees</div>
          <div className="metric-value">{overview?.totalEmployees || 0}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Inventory Value</div>
          <div className="metric-value">₹{(overview?.inventoryValue || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="metric-card" style={{ borderLeftColor: '#ea580c' }}>
          <div className="metric-label">Pending POs</div>
          <div className="metric-value">{overview?.pendingPOs || 0}</div>
        </div>
        <div className="metric-card" style={{ borderLeftColor: '#dc2626' }}>
          <div className="metric-label">Low Stock Items</div>
          <div className="metric-value">{overview?.lowStockItems || 0}</div>
        </div>
        <div className="metric-card" style={{ borderLeftColor: '#16a34a' }}>
          <div className="metric-label">Present Today</div>
          <div className="metric-value">{overview?.presentToday || 0}</div>
        </div>
        <div className="metric-card" style={{ borderLeftColor: '#0284c7' }}>
          <div className="metric-label">Pending Approvals</div>
          <div className="metric-value">{overview?.pendingApprovals || 0}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-2">
        <div className="card">
          <h3 className="card-title">Employee Distribution by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employees}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="card-title">Inventory by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="itemCount" fill="#16a34a" name="Items" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="card-title">Monthly Payroll Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={payrollData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalNetSalary" stroke="#2563eb" name="Net Salary" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="card-title">Average Salary by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={employees}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value?.toLocaleString('en-IN')}`} />
              <Bar dataKey="avgSalary" fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats Table */}
      <div className="card">
        <h3 className="card-title">Inventory Summary</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Items</th>
              <th>Total Quantity</th>
              <th>Total Value</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, index) => (
              <tr key={index}>
                <td><strong>{item.category}</strong></td>
                <td>{item.itemCount}</td>
                <td>{item.totalQuantity || 0}</td>
                <td>₹{(item.totalValue || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
