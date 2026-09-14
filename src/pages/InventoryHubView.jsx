import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  PlusCircle,
  ArrowRightLeft,
  Package,
  Edit3,
  Trash2,
  User,
  DollarSign,
} from 'lucide-react';

export const InventoryHubView = () => {
  const { role } = useAuth();

  const [masterItems, setMasterItems] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Master Stock Modal
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('');
  const [itemUnit, setItemUnit] = useState('bags');
  const [itemUnitCost, setItemUnitCost] = useState('');
  const [paidToName, setPaidToName] = useState('');
  const [debitBy, setDebitBy] = useState('');
  const [managedBy, setManagedBy] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [itemPhoto, setItemPhoto] = useState(null);
  const [submittingMaster, setSubmittingMaster] = useState(false);

  // Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedMasterItem, setSelectedMasterItem] = useState(null);
  const [targetSiteId, setTargetSiteId] = useState('');
  const [transferQty, setTransferQty] = useState('');
  const [submittingTransfer, setSubmittingTransfer] = useState(false);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [masterRes, sitesRes] = await Promise.all([
        api.get('/inventory/master'),
        api.get('/sites'),
      ]);
      setMasterItems(masterRes.data || []);
      setSites(sitesRes.data || []);
    } catch (err) {
      console.error('Error fetching inventory hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMasterModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemQty(item.quantity);
      setItemUnit(item.unit);
      setItemUnitCost(item.unitCost);
      setPaidToName(item.paidToName || '');
      setDebitBy(item.debitBy || '');
      setManagedBy(item.managedBy || '');
      setPaidAmount(item.paidAmount || '');
    } else {
      setEditingItem(null);
      setItemName('');
      setItemQty('');
      setItemUnit('bags');
      setItemUnitCost('');
      setPaidToName('');
      setDebitBy('');
      setManagedBy('');
      setPaidAmount('');
    }
    setShowMasterModal(true);
  };

  const handleSaveMasterStock = async (e) => {
    e.preventDefault();
    setSubmittingMaster(true);
    try {
      const formData = new FormData();
      formData.append('name', itemName);
      formData.append('quantity', itemQty);
      formData.append('unit', itemUnit);
      formData.append('unitCost', itemUnitCost);
      formData.append('paidToName', paidToName);
      formData.append('debitBy', debitBy);
      formData.append('managedBy', managedBy);
      formData.append('paidAmount', paidAmount || 0);
      if (itemPhoto) formData.append('image', itemPhoto);

      if (editingItem) {
        await api.put(`/inventory/${editingItem._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/inventory/master', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setShowMasterModal(false);
      setItemPhoto(null);
      fetchInventoryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save inventory item');
    } finally {
      setSubmittingMaster(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      fetchInventoryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleTransferStock = async (e) => {
    e.preventDefault();
    if (!selectedMasterItem || !targetSiteId) return;
    setSubmittingTransfer(true);

    try {
      await api.post('/inventory/transfer', {
        masterItemId: selectedMasterItem._id,
        siteId: targetSiteId,
        quantity: parseFloat(transferQty),
      });

      setShowTransferModal(false);
      setSelectedMasterItem(null);
      setTransferQty('');
      fetchInventoryData();
    } catch (err) {
      alert(err.response?.data?.message || 'Stock transfer failed');
    } finally {
      setSubmittingTransfer(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
        Loading Master Inventory Pool...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #2563eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Boxes color="#2563eb" size={22} /> Central Master Inventory & Ledger
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.1rem' }}>
              Central material pool with vendor payment tracking, debit/managed tags, due & advance amounts.
            </p>
          </div>

          {role === 'master_admin' && (
            <button className="btn btn-primary" onClick={() => handleOpenMasterModal(null)}>
              <PlusCircle size={15} /> Add Stock Material
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '0.75rem' }}>
        {masterItems.map((item) => {
          const totalValuation = (item.quantity || 0) * (item.unitCost || 0);
          const paidAmt = item.paidAmount || 0;
          const dueAmt = totalValuation > paidAmt ? totalValuation - paidAmt : 0;
          const extraAmt = paidAmt > totalValuation ? paidAmt - totalValuation : 0;

          return (
            <div key={item._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</h3>
                  {role === 'master_admin' && (
                    <div style={{ display: 'flex', gap: '0.2rem' }}>
                      <button
                        onClick={() => handleOpenMasterModal(item)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: '2px' }}
                        title="Edit Item"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}
                        title="Delete Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '6px', marginBottom: '0.5rem' }}
                  />
                ) : null}

                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.35rem' }}>
                  {item.quantity} <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.unit} available</span>
                </div>

                {/* Financial Ledger Detail Box */}
                <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Unit Cost:</span>
                    <strong style={{ color: '#0f172a' }}>₹{item.unitCost} / {item.unit}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Total Stock Cost:</span>
                    <strong style={{ color: '#0f172a' }}>₹{totalValuation.toLocaleString('en-IN')}</strong>
                  </div>

                  {item.paidToName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Paid To Name:</span>
                      <strong style={{ color: '#0f172a' }}>{item.paidToName}</strong>
                    </div>
                  )}

                  {item.debitBy && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Debit By:</span>
                      <strong style={{ color: '#0f172a' }}>{item.debitBy}</strong>
                    </div>
                  )}

                  {item.managedBy && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Managed By:</span>
                      <strong style={{ color: '#0f172a' }}>{item.managedBy}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.25rem', marginTop: '0.15rem' }}>
                    <span style={{ color: '#64748b' }}>Amount Paid:</span>
                    <strong style={{ color: '#059669' }}>₹{paidAmt.toLocaleString('en-IN')}</strong>
                  </div>

                  {dueAmt > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#dc2626', fontWeight: 600 }}>Due Balance:</span>
                      <span className="badge badge-rejected">₹{dueAmt.toLocaleString('en-IN')} DUE</span>
                    </div>
                  )}

                  {extraAmt > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#059669', fontWeight: 600 }}>Extra / Advance Paid:</span>
                      <span className="badge badge-approved">₹{extraAmt.toLocaleString('en-IN')} EXTRA</span>
                    </div>
                  )}
                </div>
              </div>

              {role === 'master_admin' && (
                <button
                  className="btn btn-blue"
                  onClick={() => {
                    setSelectedMasterItem(item);
                    setShowTransferModal(true);
                  }}
                  style={{ marginTop: '0.75rem', width: '100%' }}
                  disabled={item.quantity <= 0}
                >
                  <ArrowRightLeft size={14} /> Distribute Stock to Site
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD / EDIT MASTER STOCK */}
      {showMasterModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.75rem' }}>
              {editingItem ? 'Edit Master Material Item' : 'Add Material to Stock'}
            </h2>

            <form onSubmit={handleSaveMasterStock}>
              <div className="input-group">
                <label>Material Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Steel TMT 16mm"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <div className="input-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="1000"
                    value={itemQty}
                    onChange={(e) => setItemQty(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Unit</label>
                  <select
                    className="input-field"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                  >
                    <option value="bags">bags</option>
                    <option value="tons">tons</option>
                    <option value="kg">kg</option>
                    <option value="units">units</option>
                    <option value="liters">liters</option>
                    <option value="sqft">sqft</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="input-group">
                  <label>Unit Cost (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="380"
                    value={itemUnitCost}
                    onChange={(e) => setItemUnitCost(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Amount Paid So Far (₹)</label>
                  <input
                    type="number"
                    step="any"
                    className="input-field"
                    placeholder="0.00"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Vendor & Payment Ledger Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="input-group">
                  <label>Paid To Name (Vendor/Supplier)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Agarwal Traders"
                    value={paidToName}
                    onChange={(e) => setPaidToName(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Debit By (Payer)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Anku kumari"
                    value={debitBy}
                    onChange={(e) => setDebitBy(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Managed By (Supervisor/Manager)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Santosh mishra"
                  value={managedBy}
                  onChange={(e) => setManagedBy(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Photo File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setItemPhoto(e.target.files[0])}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowMasterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingMaster}>
                  {submittingMaster ? 'Saving...' : 'Save Stock Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER STOCK */}
      {showTransferModal && selectedMasterItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.75rem' }}>Distribute Material to Site</h2>

            <form onSubmit={handleTransferStock}>
              <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                Material: <strong style={{ color: '#0f172a' }}>{selectedMasterItem.name}</strong><br />
                Available Pool: <strong style={{ color: '#2563eb' }}>{selectedMasterItem.quantity} {selectedMasterItem.unit}</strong>
              </div>

              <div className="input-group">
                <label>Select Target Site *</label>
                <select
                  className="input-field"
                  value={targetSiteId}
                  onChange={(e) => setTargetSiteId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Site --</option>
                  {sites.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Transfer Quantity ({selectedMasterItem.unit}) *</label>
                <input
                  type="number"
                  step="any"
                  max={selectedMasterItem.quantity}
                  className="input-field"
                  value={transferQty}
                  onChange={(e) => setTransferQty(e.target.value)}
                  placeholder={`Max: ${selectedMasterItem.quantity}`}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowTransferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingTransfer}>
                  {submittingTransfer ? 'Transferring...' : 'Confirm Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
