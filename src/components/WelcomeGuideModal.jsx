import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HardHat, CheckCircle2, Building2, ClipboardList, Package, ShieldCheck, X } from 'lucide-react';

export const WelcomeGuideModal = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const guideKey = `sitemaster_guide_seen_${user.id || user._id}`;
      const hasSeenGuide = localStorage.getItem(guideKey);
      if (!hasSeenGuide) {
        setIsOpen(true);
      }
    }
  }, [user]);

  const handleDismiss = () => {
    if (user) {
      const guideKey = `sitemaster_guide_seen_${user.id || user._id}`;
      localStorage.setItem(guideKey, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen || !user) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '520px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
          color: '#ffffff',
          padding: '1.5rem',
          position: 'relative',
        }}>
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '0.5rem',
              borderRadius: '10px',
              display: 'flex',
            }}>
              <HardHat size={26} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Welcome, {user.name || 'User'}! 🎉
              </h2>
              <span style={{
                display: 'inline-block',
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '2px 8px',
                borderRadius: '12px',
                marginTop: '4px',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.5px',
              }}>
                Role: {user.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#dbeafe', margin: 0, marginTop: '0.5rem' }}>
            First time logging into SiteMaster Pro System. Here is a quick guide to help you get started:
          </p>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '380px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.5rem', borderRadius: '8px' }}>
                <Building2 size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 600 }}>1. Site Management</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  {user.role === 'supervisor' 
                    ? 'View assigned construction site details, daily work logs, and site progress.' 
                    : 'Manage construction sites, assign supervisors/admins, and set payment phases.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.5rem', borderRadius: '8px' }}>
                <ClipboardList size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 600 }}>2. Material & Expense Requests</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  {user.role === 'supervisor'
                    ? 'Raise material requirement or emergency expense requests directly from your site.'
                    : 'Review, approve, or reject supervisor requests with comments and reimbursement tracking.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#fef3c7', color: '#d97706', padding: '0.5rem', borderRadius: '8px' }}>
                <Package size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 600 }}>3. Inventory Pool & Transfers</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Track master warehouse inventory pool and material transfers across sites in real-time.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ background: '#f3e8ff', color: '#9333ea', padding: '0.5rem', borderRadius: '8px' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#0f172a', fontWeight: 600 }}>4. Audit Logs & System Health</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                  Complete immutable audit history of all site activities and system operations.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleDismiss}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.25rem',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            Got it, Let's Start <CheckCircle2 size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};
