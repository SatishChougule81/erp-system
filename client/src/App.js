import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Inventory from './pages/Inventory';
import PurchaseOrders from './pages/PurchaseOrders';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Procurement from './pages/Procurement';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">📊 ERP System</Link>
            <div className="nav-menu">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/employees" className="nav-link">Employees</Link>
              <Link to="/inventory" className="nav-link">Inventory</Link>
              <Link to="/purchase-orders" className="nav-link">POs</Link>
              <Link to="/attendance" className="nav-link">Attendance</Link>
              <Link to="/payroll" className="nav-link">Payroll</Link>
              <Link to="/procurement" className="nav-link">Procurement</Link>
              <span className="nav-user">👤 {user?.fullName}</span>
              <button onClick={handleLogout} className="nav-logout">Logout</button>
            </div>
          </div>
        </nav>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard token={token} />} />
            <Route path="/employees" element={<Employees token={token} />} />
            <Route path="/inventory" element={<Inventory token={token} />} />
            <Route path="/purchase-orders" element={<PurchaseOrders token={token} />} />
            <Route path="/attendance" element={<Attendance token={token} />} />
            <Route path="/payroll" element={<Payroll token={token} />} />
            <Route path="/procurement" element={<Procurement token={token} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
