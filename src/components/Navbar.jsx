import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppName } from '../context/BrandingContext';
import { useSite } from '../context/SiteContext';
import {
  HardHat,
  LayoutDashboard,
  ClipboardList,
  Boxes,
  FileSpreadsheet,
  LogOut,
  Building2,
  User,
  Menu,
  X,
  DollarSign,
} from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const { assignedSites, activeSiteId, setActiveSiteId } = useSite();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSiteChange = (e) => {
    const selectedSiteId = e.target.value;
    setActiveSiteId(selectedSiteId);
    if (location.pathname.startsWith('/site')) {
      navigate(`/site/${selectedSiteId}`);
    }
  };

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0.6rem 1rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        {/* Brand Name & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: '#2563eb',
            padding: '0.35rem',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <HardHat size={18} color="#ffffff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}>
            <AppName showEditBtn={true} />
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Site Switcher */}
          {assignedSites && assignedSites.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
            }}>
              <Building2 size={14} color="#2563eb" />
              <select
                value={activeSiteId || ''}
                onChange={handleSiteChange}
                style={{
                  background: 'transparent',
                  color: '#0f172a',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  maxWidth: '160px',
                }}
              >
                {assignedSites.map((site) => (
                  <option key={site._id} value={site._id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {role === 'master_admin' && (
              <>
                <Link
                  to="/dashboard"
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    color: location.pathname.startsWith('/dashboard') ? '#2563eb' : '#475569',
                    background: location.pathname.startsWith('/dashboard') ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <LayoutDashboard size={15} /> Dashboard
                </Link>

                <Link
                  to="/inventory"
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    color: location.pathname.startsWith('/inventory') ? '#2563eb' : '#475569',
                    background: location.pathname.startsWith('/inventory') ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Boxes size={15} /> Inventory
                </Link>

                <Link
                  to="/audit-log"
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    color: location.pathname.startsWith('/audit-log') ? '#2563eb' : '#475569',
                    background: location.pathname.startsWith('/audit-log') ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <FileSpreadsheet size={15} /> Logs
                </Link>
              </>
            )}

            {(role === 'admin' || role === 'master_admin') && (
              <>
                <Link
                  to="/site-finance"
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    color: location.pathname.startsWith('/site-finance') ? '#2563eb' : '#475569',
                    background: location.pathname.startsWith('/site-finance') ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <DollarSign size={15} /> Site Finance
                </Link>

                <Link
                  to="/requests"
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: '6px',
                    color: location.pathname.startsWith('/requests') ? '#2563eb' : '#475569',
                    background: location.pathname.startsWith('/requests') ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <ClipboardList size={15} /> Requests
                </Link>
              </>
            )}

            {activeSiteId && (
              <Link
                to={`/site/${activeSiteId}`}
                style={{
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  color: location.pathname.startsWith('/site') ? '#2563eb' : '#475569',
                  background: location.pathname.startsWith('/site') ? '#eff6ff' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Building2 size={15} /> Feed
              </Link>
            )}
          </nav>

          {/* User badge & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ minHeight: '30px', padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Icon (Wraps ALL options inside drawer) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-only"
          style={{
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '0.35rem',
            color: '#0f172a',
            cursor: 'pointer',
          }}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-only" style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '0.85rem',
          marginTop: '0.5rem',
          flexDirection: 'column',
          gap: '0.65rem',
        }}>
          {/* Mobile User Info */}
          <div style={{ padding: '0.5rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem' }}>
            <strong style={{ color: '#0f172a', display: 'block' }}>{user.name}</strong>
            <span style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'capitalize' }}>{user.role.replace('_', ' ')}</span>
          </div>

          {/* Mobile Site Switcher */}
          {assignedSites && assignedSites.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Switch Active Site:</label>
              <select
                value={activeSiteId || ''}
                onChange={(e) => {
                  handleSiteChange(e);
                  setMobileMenuOpen(false);
                }}
                className="input-field"
                style={{ minHeight: '34px', fontSize: '0.82rem', padding: '0.3rem 0.5rem' }}
              >
                {assignedSites.map((site) => (
                  <option key={site._id} value={site._id}>
                    📍 {site.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Links inside Mobile Drawer */}
          {activeSiteId && (
            <Link
              to={`/site/${activeSiteId}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                color: '#0f172a',
                background: location.pathname.startsWith('/site') ? '#eff6ff' : '#f8fafc',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <Building2 size={16} color="#2563eb" /> Site Work Feed
            </Link>
          )}

          {(role === 'admin' || role === 'master_admin') && (
            <>
              <Link
                to="/site-finance"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  color: '#0f172a',
                  background: location.pathname.startsWith('/site-finance') ? '#eff6ff' : '#f8fafc',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <DollarSign size={16} color="#2563eb" /> Site Finance Ledger
              </Link>

              <Link
                to="/requests"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  color: '#0f172a',
                  background: location.pathname.startsWith('/requests') ? '#eff6ff' : '#f8fafc',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <ClipboardList size={16} color="#2563eb" /> Requests Queue
              </Link>
            </>
          )}

          <Link
            to="/inventory"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              color: '#0f172a',
              background: location.pathname.startsWith('/inventory') ? '#eff6ff' : '#f8fafc',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            <Boxes size={16} color="#2563eb" /> Master Inventory
          </Link>

          {role === 'master_admin' && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  color: '#0f172a',
                  background: location.pathname.startsWith('/dashboard') ? '#eff6ff' : '#f8fafc',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <LayoutDashboard size={16} color="#2563eb" /> Master Dashboard
              </Link>

              <Link
                to="/audit-log"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  color: '#0f172a',
                  background: location.pathname.startsWith('/audit-log') ? '#eff6ff' : '#f8fafc',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <FileSpreadsheet size={16} color="#2563eb" /> System Audit Logs
              </Link>
            </>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              marginTop: '0.35rem',
            }}
          >
            <LogOut size={16} /> Logout Account
          </button>
        </div>
      )}
    </header>
  );
};
