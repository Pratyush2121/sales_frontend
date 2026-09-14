import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppName } from '../context/BrandingContext';
import { HardHat, Lock, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

export const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(email, password);

      if (loggedUser.role === 'supervisor') {
        const siteId = loggedUser.assignedSiteIds && loggedUser.assignedSiteIds.length > 0
          ? (typeof loggedUser.assignedSiteIds[0] === 'object' ? loggedUser.assignedSiteIds[0]._id : loggedUser.assignedSiteIds[0])
          : null;
        if (siteId) {
          navigate(`/site/${siteId}`);
        } else {
          navigate('/dashboard');
        }
      } else if (loggedUser.role === 'admin') {
        navigate('/requests');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check email and password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: '#f8fafc',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            background: '#2563eb',
            marginBottom: '0.75rem',
          }}>
            <HardHat size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            <AppName />
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Construction Site Management CRM
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.6rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}>
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem', padding: '0.6rem', fontSize: '0.9rem' }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textAlign: 'center' }}>
              Quick Demo Accounts (Password: Password123!)
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.72rem', minHeight: '30px' }}
                onClick={() => fillDemoAccount('master@sitemaster.com')}
              >
                Master Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.72rem', minHeight: '30px' }}
                onClick={() => fillDemoAccount('admin@sitemaster.com')}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.3rem 0.5rem', fontSize: '0.72rem', minHeight: '30px' }}
                onClick={() => fillDemoAccount('supervisor@sitemaster.com')}
              >
                Supervisor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
