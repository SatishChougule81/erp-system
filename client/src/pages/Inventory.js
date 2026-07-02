// Inventory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Inventory({ token }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ itemCode: '', itemName: '', category: '', quantity: 0, minQuantity: 10, unitPrice: 0, reorderLevel: 20, supplier: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, [token]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/api/inventory', { headers: { Authorization: `Bearer ${token}` } });
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/inventory', formData, { headers: { Authorization: `Bearer ${token}` } });
      setFormData({ itemCode: '', itemName: '', category: '', quantity: 0, minQuantity: 10, unitPrice: 0, reorderLevel: 20, supplier: '' });
      setShowForm(false);
      fetchInventory();
      alert('Item added successfully');
    } catch (error) {
      alert(error.response?.data?.error || 'Error adding item');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'quantity' || name === 'unitPrice' || name === 'minQuantity' || name === 'reorderLevel' ? Number(value) : value }));
  };

  if (loading) return <div className="loading">Loading inventory...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Inventory Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ Add Item</button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Item Code</label><input type="text" name="itemCode" className="form-input" value={formData.itemCode} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Item Name</label><input type="text" name="itemName" className="form-input" value={formData.itemName} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Category</label><input type="text" name="category" className="form-input" value={formData.category} onChange={handleChange} required /></div>
              <div className="form-group"><label className="form-label">Quantity</label><input type="number" name="quantity" className="form-input" value={formData.quantity} onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label">Unit Price</label><input type="number" name="unitPrice" className="form-input" value={formData.unitPrice} onChange={handleChange} step="0.01" /></div>
              <div className="form-group"><label className="form-label">Min Quantity</label><input type="number" name="minQuantity" className="form-input" value={formData.minQuantity} onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label">Reorder Level</label><input type="number" name="reorderLevel" className="form-input" value={formData.reorderLevel} onChange={handleChange} /></div>
              <div className="form-group"><label className="form-label">Supplier</label><input type="text" name="supplier" className="form-input" value={formData.supplier} onChange={handleChange} /></div>
            </div>
            <button type="submit" className="btn btn-primary">Add Item</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Quantity</th><th>Unit Price</th><th>Total Value</th><th>Status</th></tr></thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td><strong>{item.itemCode}</strong></td>
                <td>{item.itemName}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>₹{item.unitPrice.toFixed(2)}</td>
                <td>₹{(item.quantity * item.unitPrice).toLocaleString('en-IN')}</td>
                <td><span className="table-status" style={{ background: item.quantity < item.minQuantity ? '#fee2e2' : '#dcfce7', color: item.quantity < item.minQuantity ? '#991b1b' : '#166534' }}>{item.quantity < item.minQuantity ? 'Low Stock' : 'Ok'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Inventory;
