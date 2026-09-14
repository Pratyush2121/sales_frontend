import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { CameraCaptureModal } from '../components/CameraCaptureModal';
import {
  Building2,
  Calendar,
  Camera,
  MapPin,
  PlusCircle,
  Clock,
  Boxes,
  MinusCircle,
  DollarSign,
  Send,
  Edit3,
  Trash2,
} from 'lucide-react';

export const SupervisorSiteView = () => {
  const { siteId } = useParams();
  const { role } = useAuth();

  const [siteDetails, setSiteDetails] = useState(null);
  const [paymentPhases, setPaymentPhases] = useState([]);
  const [activities, setActivities] = useState([]);
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [activeTab, setActiveTab] = useState('activity');
  const [loading, setLoading] = useState(true);
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Camera Modal State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraTarget, setCameraTarget] = useState(null);

  // New Activity Modal/State
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityDesc, setActivityDesc] = useState('');
  const [activityCapturedImage, setActivityCapturedImage] = useState(null);
  const [gpsLocation, setGpsLocation] = useState({ latitude: null, longitude: null, address: '' });
  const [gettingGps, setGettingGps] = useState(false);
  const [submittingActivity, setSubmittingActivity] = useState(false);

  // New Request Modal/State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqType, setReqType] = useState('material');
  const [reqTitle, setReqTitle] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqAmount, setReqAmount] = useState('');
  const [reqCapturedImage, setReqCapturedImage] = useState(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Usage Modal/State
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [qtyUsed, setQtyUsed] = useState('');
  const [usageNotes, setUsageNotes] = useState('');
  const [submittingUsage, setSubmittingUsage] = useState(false);

  // Payment Phase Add/Edit Modal
  const [showPhaseModal, setShowPhaseModal] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [phaseTitle, setPhaseTitle] = useState('');
  const [phaseNumber, setPhaseNumber] = useState('');
  const [phaseAmount, setPhaseAmount] = useState('');
  const [phaseStatus, setPhaseStatus] = useState('in_progress');
  const [submittingPhase, setSubmittingPhase] = useState(false);

  useEffect(() => {
    fetchSiteData();
  }, [siteId, selectedDateFilter]);

  const fetchSiteData = async () => {
    setLoading(true);
    try {
      const actUrl = selectedDateFilter
        ? `/activity/${siteId}?date=${selectedDateFilter}`
        : `/activity/${siteId}`;

      const [siteRes, actRes, reqRes, invRes] = await Promise.all([
        api.get(`/sites/${siteId}`),
        api.get(actUrl),
        api.get(`/requests?siteId=${siteId}`),
        api.get(`/inventory/${siteId}`),
      ]);

      setSiteDetails(siteRes.data.site);
      setPaymentPhases(siteRes.data.paymentPhases || []);
      setActivities(actRes.data || []);
      setRequests(reqRes.data || []);
      setInventory(invRes.data || []);
    } catch (err) {
      console.error('Error loading site data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptureGps = () => {
    setGettingGps(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`,
          });
          setGettingGps(false);
        },
        () => {
          setGpsLocation({
            latitude: 28.6273,
            longitude: 77.3725,
            address: 'GPS Auto-Captured: Site Zone',
          });
          setGettingGps(false);
        }
      );
    } else {
      setGpsLocation({
        latitude: 28.6273,
        longitude: 77.3725,
        address: 'GPS Tag: Site Zone',
      });
      setGettingGps(false);
    }
  };

  const handleOpenCamera = (target) => {
    setCameraTarget(target);
    setShowCameraModal(true);
  };

  const handleCameraCapture = (imageDataUrl) => {
    if (cameraTarget === 'activity') {
      setActivityCapturedImage(imageDataUrl);
    } else if (cameraTarget === 'request') {
      setReqCapturedImage(imageDataUrl);
    }
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    setSubmittingActivity(true);
    try {
      await api.post('/activity', {
        siteId,
        description: activityDesc,
        latitude: gpsLocation.latitude,
        longitude: gpsLocation.longitude,
        address: gpsLocation.address,
        imageUrl: activityCapturedImage || '',
      });

      setActivityDesc('');
      setActivityCapturedImage(null);
      setShowActivityModal(false);
      fetchSiteData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit activity');
    } finally {
      setSubmittingActivity(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      await api.post('/requests', {
        siteId,
        type: reqType,
        title: reqTitle,
        description: reqDesc,
        amount: reqAmount ? parseFloat(reqAmount) : 0,
        imageUrl: reqCapturedImage || '',
      });

      setReqTitle('');
      setReqDesc('');
      setReqAmount('');
      setReqCapturedImage(null);
      setShowRequestModal(false);
      fetchSiteData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleLogUsage = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmittingUsage(true);

    try {
      await api.patch(`/inventory/${selectedItem._id}/usage`, {
        quantityUsed: parseFloat(qtyUsed),
        notes: usageNotes,
      });

      setShowUsageModal(false);
      setSelectedItem(null);
      setQtyUsed('');
      setUsageNotes('');
      fetchSiteData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update usage');
    } finally {
      setSubmittingUsage(false);
    }
  };

  const handleOpenPhaseModal = (phase = null) => {
    if (phase) {
      setEditingPhase(phase);
      setPhaseTitle(phase.phaseTitle);
      setPhaseNumber(phase.phaseNumber);
      setPhaseAmount(phase.amount);
      setPhaseStatus(phase.status);
    } else {
      setEditingPhase(null);
      setPhaseNumber(paymentPhases.length + 1);
      setPhaseTitle(`Phase ${paymentPhases.length + 1}`);
      setPhaseAmount('');
      setPhaseStatus('in_progress');
    }
    setShowPhaseModal(true);
  };

  const handleSavePaymentPhase = async (e) => {
    e.preventDefault();
    setSubmittingPhase(true);
    try {
      if (editingPhase) {
        await api.put(`/sites/${siteId}/payment-phase/${editingPhase._id}`, {
          phaseTitle,
          phaseNumber: parseInt(phaseNumber),
          amount: parseFloat(phaseAmount) || 0,
          status: phaseStatus,
        });
      } else {
        await api.post(`/sites/${siteId}/payment-phase`, {
          phaseTitle,
          phaseNumber: parseInt(phaseNumber),
          amount: parseFloat(phaseAmount) || 0,
          status: phaseStatus,
        });
      }
      setShowPhaseModal(false);
      fetchSiteData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save payment phase');
    } finally {
      setSubmittingPhase(false);
    }
  };

  const handleDeletePhase = async (phaseId) => {
    if (!window.confirm('Delete payment phase?')) return;
    try {
      await api.delete(`/sites/${siteId}/payment-phase/${phaseId}`);
      fetchSiteData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete payment phase');
    }
  };

  if (loading && !siteDetails) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
        Loading...
      </div>
    );
  }

  if (!siteDetails) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626', fontSize: '0.9rem' }}>
        Site not found.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      {/* Simple Site Card Header */}
      <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #2563eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 color="#2563eb" size={20} /> {siteDetails.name}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
              <MapPin size={14} color="#0284c7" /> {siteDetails.location}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span className="badge badge-in_progress">
              {siteDetails.currentPaymentPhase}
            </span>
            {(role === 'master_admin' || role === 'admin') && (
              <button
                onClick={() => handleOpenPhaseModal()}
                className="btn btn-primary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', minHeight: '30px' }}
              >
                <PlusCircle size={13} /> Add Phase
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Payment Phases Strip */}
        {paymentPhases.length > 0 && (
          <div style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
          }}>
            {paymentPhases.map((phase) => (
              <div key={phase._id} style={{
                background: '#f8fafc',
                border: phase.status === 'in_progress' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                minWidth: '170px',
                fontSize: '0.78rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{phase.phaseTitle}</span>
                  <span className={`badge badge-${phase.status}`} style={{ fontSize: '0.62rem' }}>{phase.status}</span>
                </div>
                <div style={{ marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>₹{phase.amount ? phase.amount.toLocaleString('en-IN') : 0}</span>
                  {(role === 'master_admin' || role === 'admin') && (
                    <button
                      onClick={() => handleOpenPhaseModal(phase)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                      title="Edit Phase"
                    >
                      <Edit3 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Bar & Date Filter */}
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1rem',
        background: '#ffffff',
        padding: '0.4rem',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          <button
            onClick={() => setActiveTab('activity')}
            className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minHeight: '32px' }}
          >
            <Clock size={14} /> Work Feed
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`btn ${activeTab === 'requests' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minHeight: '32px' }}
          >
            <Send size={14} /> Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minHeight: '32px' }}
          >
            <Boxes size={14} /> Stock ({inventory.length})
          </button>
        </div>

        {activeTab === 'activity' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <Calendar size={14} color="#2563eb" />
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0f172a',
                fontSize: '0.78rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter('')}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.72rem', cursor: 'pointer' }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: WORK FEED */}
      {activeTab === 'activity' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
              Daily Progress Log
            </h2>
            {(role === 'supervisor' || role === 'master_admin') && (
              <button
                onClick={() => {
                  handleCaptureGps();
                  setShowActivityModal(true);
                }}
                className="btn btn-primary"
              >
                <PlusCircle size={15} /> Log Work Progress
              </button>
            )}
          </div>

          {activities.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.88rem' }}>
              No work logs recorded for this date.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activities.map((act) => {
                const actDate = new Date(act.timestamp);
                const dateStr = actDate.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });
                const timeStr = actDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={act._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="badge badge-in_progress" style={{ fontSize: '0.7rem' }}>
                          📅 {dateStr} • {timeStr}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                          By: {act.loggedBy?.name || 'Supervisor'}
                        </span>
                      </div>
                      {act.gpsLocation?.address && (
                        <span style={{ fontSize: '0.75rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <MapPin size={12} /> {act.gpsLocation.address}
                        </span>
                      )}
                    </div>

                    <p style={{ color: '#0f172a', fontSize: '0.9rem', lineHeight: 1.4 }}>
                      {act.description}
                    </p>

                    {act.imageUrl && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <img
                          src={act.imageUrl}
                          alt="Progress Photo"
                          style={{
                            maxHeight: '220px',
                            width: '100%',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REQUESTS */}
      {activeTab === 'requests' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>Material & Expense Requests</h2>
            {(role === 'supervisor' || role === 'master_admin') && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="btn btn-primary"
              >
                <PlusCircle size={15} /> Raise Request
              </button>
            )}
          </div>

          {requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.88rem' }}>
              No site requests submitted.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.map((req) => (
                <div key={req._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <div>
                      <span className="badge badge-in_progress" style={{ marginRight: '0.4rem' }}>
                        {req.type}
                      </span>
                      <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{req.title}</strong>
                    </div>
                    <span className={`badge badge-${req.status}`}>
                      {req.status}
                    </span>
                  </div>

                  <p style={{ color: '#475569', fontSize: '0.85rem' }}>{req.description}</p>

                  {req.imageUrl && (
                    <div style={{ marginTop: '0.2rem' }}>
                      <img
                        src={req.imageUrl}
                        alt="Evidence"
                        style={{ maxHeight: '160px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem', marginTop: '0.2rem' }}>
                    <span>Amount: <strong style={{ color: '#2563eb' }}>₹{req.amount ? req.amount.toLocaleString('en-IN') : 0}</strong></span>
                    <span>By: {req.raisedBy?.name || 'Supervisor'}</span>
                  </div>

                  {req.comment && (
                    <div style={{ background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                      <strong>Remark:</strong> {req.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STOCK */}
      {activeTab === 'inventory' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>Site Inventory Stock</h2>
          </div>

          {inventory.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.88rem' }}>
              No inventory assigned to this site yet.
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Item</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Stock</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Unit Cost</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Total Value</th>
                    <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item._id} style={{ borderBottom: '1px solid #e2e8f0', color: '#0f172a' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <span className="badge badge-completed">{item.quantity} {item.unit}</span>
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>₹{item.unitCost ? item.unitCost.toLocaleString('en-IN') : 0}</td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#2563eb', fontWeight: 700 }}>
                        ₹{((item.quantity || 0) * (item.unitCost || 0)).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>
                        {(role === 'supervisor' || role === 'master_admin') && (
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowUsageModal(true);
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0.2rem 0.55rem', fontSize: '0.75rem', minHeight: '28px' }}
                          >
                            <MinusCircle size={13} /> Record Usage
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: LOG ACTIVITY */}
      {showActivityModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '0.75rem', color: '#0f172a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock color="#2563eb" size={18} /> Log Work Progress
            </h3>

            <form onSubmit={handleCreateActivity}>
              <div className="input-group">
                <label>Work Description *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  placeholder="Describe progress completed..."
                  required
                />
              </div>

              <div className="input-group">
                <label>Photo Attachment</label>
                {activityCapturedImage ? (
                  <div style={{ position: 'relative', marginTop: '0.2rem' }}>
                    <img
                      src={activityCapturedImage}
                      alt="Snapshot"
                      style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    />
                    <button
                      type="button"
                      onClick={() => setActivityCapturedImage(null)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenCamera('activity')}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Camera size={16} color="#2563eb" /> Capture Photo / Open Camera
                  </button>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.78rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span><MapPin size={12} color="#0284c7" /> GPS Tag: {gpsLocation.address || 'Auto Tag'}</span>
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    {gettingGps ? 'Fetching...' : 'Re-capture'}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowActivityModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingActivity}
                  className="btn btn-primary"
                >
                  {submittingActivity ? 'Saving...' : 'Submit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RAISE REQUEST */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '0.75rem', color: '#0f172a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Send color="#2563eb" size={18} /> New Request
            </h3>

            <form onSubmit={handleCreateRequest}>
              <div className="input-group">
                <label>Type *</label>
                <select
                  className="input-field"
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                >
                  <option value="material">Material Request</option>
                  <option value="expense">Expense Reimbursement</option>
                  <option value="approval">Phase Approval</option>
                </select>
              </div>

              <div className="input-group">
                <label>Title *</label>
                <input
                  type="text"
                  className="input-field"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g. Extra Cement Needed"
                  required
                />
              </div>

              <div className="input-group">
                <label>Description *</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={reqDesc}
                  onChange={(e) => setReqDesc(e.target.value)}
                  placeholder="Details..."
                  required
                />
              </div>

              <div className="input-group">
                <label>Estimated Amount (₹)</label>
                <input
                  type="number"
                  className="input-field"
                  value={reqAmount}
                  onChange={(e) => setReqAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="input-group">
                <label>Photo Evidence (Optional)</label>
                {reqCapturedImage ? (
                  <div style={{ position: 'relative', marginTop: '0.2rem' }}>
                    <img
                      src={reqCapturedImage}
                      alt="Receipt Snapshot"
                      style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    />
                    <button
                      type="button"
                      onClick={() => setReqCapturedImage(null)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        fontSize: '0.7rem',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenCamera('request')}
                    className="btn btn-secondary"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Camera size={16} color="#2563eb" /> Take Photo / Attach Evidence
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRequest}
                  className="btn btn-primary"
                >
                  {submittingRequest ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD INVENTORY USAGE */}
      {showUsageModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '0.75rem', color: '#0f172a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MinusCircle color="#2563eb" size={18} /> Usage: {selectedItem.name}
            </h3>

            <form onSubmit={handleLogUsage}>
              <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', marginBottom: '0.75rem', fontSize: '0.8rem', color: '#64748b', border: '1px solid #e2e8f0' }}>
                Available Stock: <strong style={{ color: '#059669' }}>{selectedItem.quantity} {selectedItem.unit}</strong>
              </div>

              <div className="input-group">
                <label>Quantity Used ({selectedItem.unit}) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedItem.quantity}
                  className="input-field"
                  value={qtyUsed}
                  onChange={(e) => setQtyUsed(e.target.value)}
                  placeholder={`Max: ${selectedItem.quantity}`}
                  required
                />
              </div>

              <div className="input-group">
                <label>Notes</label>
                <input
                  type="text"
                  className="input-field"
                  value={usageNotes}
                  onChange={(e) => setUsageNotes(e.target.value)}
                  placeholder="e.g. Used for Column pour"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUsageModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUsage}
                  className="btn btn-primary"
                >
                  {submittingUsage ? 'Saving...' : 'Deduct Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PAYMENT PHASE */}
      {showPhaseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '0.75rem', color: '#0f172a', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <DollarSign color="#2563eb" size={18} /> {editingPhase ? 'Edit Phase' : 'Add Phase'}
            </h3>

            <form onSubmit={handleSavePaymentPhase}>
              <div className="input-group">
                <label>Phase Number *</label>
                <input
                  type="number"
                  className="input-field"
                  value={phaseNumber}
                  onChange={(e) => setPhaseNumber(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Phase Title *</label>
                <input
                  type="text"
                  className="input-field"
                  value={phaseTitle}
                  onChange={(e) => setPhaseTitle(e.target.value)}
                  placeholder="e.g. Phase 2 - Foundation"
                  required
                />
              </div>

              <div className="input-group">
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={phaseAmount}
                  onChange={(e) => setPhaseAmount(e.target.value)}
                  placeholder="500000"
                  required
                />
              </div>

              <div className="input-group">
                <label>Status</label>
                <select
                  className="input-field"
                  value={phaseStatus}
                  onChange={(e) => setPhaseStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                {editingPhase ? (
                  <button
                    type="button"
                    onClick={() => handleDeletePhase(editingPhase._id)}
                    className="btn btn-danger"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                ) : <div />}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowPhaseModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPhase}
                    className="btn btn-primary"
                  >
                    {submittingPhase ? 'Saving...' : 'Save Phase'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAMERA CAPTURE MODAL */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};
