import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

export default Payroll;
