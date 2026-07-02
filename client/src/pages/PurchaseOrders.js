// PurchaseOrders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PurchaseOrders({ token }) {
  const [pos, setPOs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ supplier: '', orderDate: '', expectedDelivery: '', items: [{ itemCode: '', itemName: '', quantity: 0, unitPrice: 0 }], notes: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPOs();
  }, [token]);

  const fetchPOs = async () => {
    try {
      const response = await axios.get('/api/purchase-orders', { headers: { Authorization: `Bearer ${token}` } });
      setPOs(response.data);
    } catch (error) {
      console.error('Failed to fetch POs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      await axios.post('/api/purchase-orders', { ...formData, totalAmount }, { headers: { Authorization: `Bearer ${token}` } });
      setFormData({ supplier: '', orderDate: '', expectedDelivery: '', items: [{ itemCode: '', itemName: '', quantity: 0, unitPrice: 0 }], notes: '' });
      setShowForm(false);
      fetchPOs();
      alert('Purchase Order created');
    } catch (error) {
      alert(error.response?.data?.error || 'Error creating PO');
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = field === 'quantity' || field === 'unitPrice' ? Number(value) : value;
    newItems[index].totalPrice = (newItems[index].quantity || 0) * (newItems[index].unitPrice || 0);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Purchase Orders</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New PO</button>
      </div>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Supplier</label><input type="text" className="form-input" value={formData.supplier} onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))} required /></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Order Date</label><input type="date" className="form-input" value={formData.orderDate} onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Expected Delivery</label><input type="date" className="form-input" value={formData.expectedDelivery} onChange={(e) => setFormData(prev => ({ ...prev, expectedDelivery: e.target.value }))} /></div>
            </div>
            
            <h4>Items</h4>
            {formData.items.map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input type="text" placeholder="Item Code" className="form-input" value={item.itemCode} onChange={(e) => handleItemChange(idx, 'itemCode', e.target.value)} />
                <input type="text" placeholder="Item Name" className="form-input" value={item.itemName} onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)} />
                <input type="number" placeholder="Qty" className="form-input" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} />
                <input type="number" placeholder="Unit Price" className="form-input" value={item.unitPrice} onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)} step="0.01" />
              </div>
            ))}
            <button type="button" className="btn btn-secondary btn-small" onClick={() => setFormData(prev => ({ ...prev, items: [...prev.items, { itemCode: '', itemName: '', quantity: 0, unitPrice: 0 }] }))}>+ Add Item</button>

            <div className="form-group" style={{ marginTop: '1rem' }}><label className="form-label">Notes</label><textarea className="form-textarea" value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} /></div>
            <button type="submit" className="btn btn-primary">Create PO</button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead><tr><th>PO Number</th><th>Supplier</th><th>Order Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            {pos.map(po => (
              <tr key={po.id}>
                <td><strong>{po.poNumber}</strong></td>
                <td>{po.supplier}</td>
                <td>{new Date(po.orderDate).toLocaleDateString()}</td>
                <td>₹{po.totalAmount?.toLocaleString('en-IN')}</td>
                <td><span className={`table-status status-${po.status}`}>{po.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PurchaseOrders;
