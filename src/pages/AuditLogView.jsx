import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  FileSpreadsheet,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Edit,
  Trash2,
  AlertTriangle,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const AuditLogView = () => {
  const { role } = useAuth();
  const [groupedLogs, setGroupedLogs] = useState({});
  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingLog, setEditingLog] = useState(null);
  const [updatedDetails, setUpdatedDetails] = useState('');
  const [editReason, setEditReason] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Modal State
  const [deletingLog, setDeletingLog] = useState(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-log');
      setGroupedLogs(res.data.groupedLogs || {});
      setAvailableDays(res.data.availableDays || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingLog) return;
    setSubmittingEdit(true);

    try {
      await api.patch(`/audit-log/${editingLog._id}`, {
        details: updatedDetails,
        reason: editReason,
      });

      setEditingLog(null);
      setUpdatedDetails('');
      setEditReason('');
      fetchAuditLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit audit log');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingLog) return;
    setSubmittingDelete(true);

    try {
      await api.delete(`/audit-log/${deletingLog._id}`);

      setDeletingLog(null);
      fetchAuditLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete audit log');
    } finally {
      setSubmittingDelete(false);
    }
  };

  const daysToDisplay = selectedDay === 'ALL' ? availableDays : [selectedDay];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
        Loading System Audit Logs...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #2563eb' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileSpreadsheet color="#2563eb" size={22} /> System Audit Logs
        </h1>
      </div>

      {/* Day Filter */}
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Calendar size={16} color="#2563eb" />
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>Select Date:</span>
        <select
          className="input-field"
          style={{ width: 'auto', minHeight: '34px', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
        >
          <option value="ALL">All Dates ({availableDays.length})</option>
          {availableDays.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      {/* Logs by Date */}
      {availableDays.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.88rem' }}>
          No system audit log entries recorded.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {daysToDisplay.map((day) => {
            const logsForDay = groupedLogs[day] || [];

            return (
              <div key={day} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                  <Calendar size={16} color="#2563eb" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{day}</h3>
                  <span className="badge badge-in_progress" style={{ fontSize: '0.7rem', marginLeft: 'auto' }}>
                    {logsForDay.length} entries
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {logsForDay.map((log) => (
                    <div
                      key={log._id}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="badge badge-in_progress" style={{ fontSize: '0.65rem' }}>
                            {log.action}
                          </span>
                          <strong style={{ color: '#0f172a' }}>{log.userName}</strong>
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({log.userRole?.replace('_', ' ')})</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {role === 'master_admin' && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingLog(log);
                                  setUpdatedDetails(log.details);
                                }}
                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                                title="Edit Entry"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => setDeletingLog(log)}
                                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px' }}
                                title="Delete Entry"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div style={{ color: '#0f172a' }}>{log.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingLog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '0.75rem', color: '#0f172a', fontSize: '1.05rem' }}>Edit Audit Log Entry</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="input-group">
                <label>Updated Details *</label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={updatedDetails}
                  onChange={(e) => setUpdatedDetails(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label>Reason for Modification *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Corrected typo in audit detail"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditingLog(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingEdit}>
                  {submittingEdit ? 'Saving...' : 'Save Audit Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingLog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ marginBottom: '0.75rem', color: '#dc2626', fontSize: '1.05rem' }}>Delete Audit Entry</h3>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Are you sure you want to delete this log entry?
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeletingLog(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" style={{ flex: 1 }} onClick={handleDeleteSubmit} disabled={submittingDelete}>
                {submittingDelete ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
