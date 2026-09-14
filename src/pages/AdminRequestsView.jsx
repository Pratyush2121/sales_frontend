import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Building2,
  Filter,
  Check,
  X,
} from 'lucide-react';

export const AdminRequestsView = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSiteId, setSelectedSiteId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sitesRes, reqsRes] = await Promise.all([
        api.get('/sites'),
        api.get('/requests'),
      ]);
      setSites(sitesRes.data || []);
      setRequests(reqsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmittingReview(true);

    try {
      await api.patch(`/requests/${selectedRequest._id}`, {
        status: reviewStatus,
        comment: reviewComment,
      });

      setSelectedRequest(null);
      setReviewComment('');
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSite = selectedSiteId === 'ALL' || req.siteId?._id === selectedSiteId || req.siteId === selectedSiteId;
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSite && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
        Loading Requests Queue...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid #2563eb' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ClipboardList color="#2563eb" size={22} /> Field Requests Queue
        </h1>
      </div>

      {/* Filter Controls */}
      <div className="card" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Filter size={15} color="#2563eb" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Filter Site:</span>
          <select
            className="input-field"
            style={{ minHeight: '34px', padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.8rem' }}
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
          >
            <option value="ALL">All Sites ({sites.length})</option>
            {sites.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Status:</span>
          <select
            className="input-field"
            style={{ minHeight: '34px', padding: '0.2rem 0.5rem', width: 'auto', fontSize: '0.8rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="pending">Pending Approvals</option>
            <option value="approved">Approved Requests</option>
            <option value="rejected">Rejected Requests</option>
            <option value="ALL">All Statuses</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.88rem' }}>
          No requests found matching criteria.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredRequests.map((req) => (
            <div key={req._id} className="card" style={{
              borderLeft: `4px solid ${
                req.status === 'approved' ? '#059669' : req.status === 'rejected' ? '#dc2626' : '#d97706'
              }`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span className="badge badge-in_progress" style={{ textTransform: 'capitalize' }}>
                      {req.type}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Building2 size={13} color="#0284c7" /> {req.siteId?.name || 'Site'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{req.title}</h3>
                </div>

                <div className={`badge badge-${req.status}`}>
                  {req.status}
                </div>
              </div>

              <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0.5rem 0' }}>{req.description}</p>

              <div style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.4rem',
                paddingTop: '0.5rem',
                borderTop: '1px solid #e2e8f0',
              }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Amount: </span>
                  <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.98rem' }}>
                    ₹{req.amount ? req.amount.toLocaleString('en-IN') : 0}
                  </span>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  By <strong>{req.raisedBy?.name}</strong> on {new Date(req.createdAt).toLocaleDateString()}
                </div>
              </div>

              {req.imageUrl && (
                <div style={{ marginTop: '0.5rem' }}>
                  <img
                    src={req.imageUrl}
                    alt="Receipt Evidence"
                    style={{ maxHeight: '150px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  />
                </div>
              )}

              {/* Action Buttons */}
              {req.status === 'pending' && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setSelectedRequest(req);
                      setReviewStatus('rejected');
                    }}
                    style={{ minHeight: '32px', padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    <X size={15} /> Reject
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setSelectedRequest(req);
                      setReviewStatus('approved');
                    }}
                    style={{ minHeight: '32px', padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                  >
                    <Check size={15} /> Approve
                  </button>
                </div>
              )}

              {req.comment && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.4rem 0.6rem',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  color: req.status === 'approved' ? '#059669' : '#dc2626',
                  border: '1px solid #e2e8f0',
                }}>
                  <strong>Remark ({req.reviewedBy?.name || 'Admin'}):</strong> {req.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* REVIEW MODAL */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{
              fontSize: '1.05rem',
              color: reviewStatus === 'approved' ? '#059669' : '#dc2626',
              marginBottom: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              {reviewStatus === 'approved' ? <CheckCircle2 color="#059669" size={18} /> : <XCircle color="#dc2626" size={18} />}
              {reviewStatus === 'approved' ? 'Approve Request' : 'Reject Request'}
            </h2>
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
              Title: <strong>{selectedRequest.title}</strong> (₹{selectedRequest.amount?.toLocaleString('en-IN')})
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div className="input-group">
                <label>Remark / Note</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder={reviewStatus === 'approved' ? 'e.g. Approved. Funds allocated.' : 'e.g. Budget exceeded.'}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${reviewStatus === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  style={{ flex: 1 }}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Processing...' : `Confirm ${reviewStatus.toUpperCase()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
