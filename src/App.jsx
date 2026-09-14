import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './pages/LoginView';
import { SupervisorSiteView } from './pages/SupervisorSiteView';
import { AdminRequestsView } from './pages/AdminRequestsView';
import { MasterDashboardView } from './pages/MasterDashboardView';
import { InventoryHubView } from './pages/InventoryHubView';
import { AuditLogView } from './pages/AuditLogView';
import { SiteFinanceView } from './pages/SiteFinanceView';
import { WelcomeGuideModal } from './components/WelcomeGuideModal';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Authenticating Session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default home for their role
    if (user.role === 'supervisor') {
      const siteId = user.assignedSiteIds?.[0]?._id || user.assignedSiteIds?.[0];
      return <Navigate to={siteId ? `/site/${siteId}` : '/login'} replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/requests" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Root Redirect Helper
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'supervisor') {
    const siteId = user.assignedSiteIds?.[0]?._id || user.assignedSiteIds?.[0];
    return <Navigate to={siteId ? `/site/${siteId}` : '/login'} replace />;
  } else if (user.role === 'admin') {
    return <Navigate to="/requests" replace />;
  }
  return <Navigate to="/dashboard" replace />;
};

export function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <WelcomeGuideModal />
      <main style={{ flex: 1, paddingBottom: '3rem' }}>
        <Routes>
          <Route path="/login" element={<LoginView />} />

          <Route
            path="/site/:siteId"
            element={
              <ProtectedRoute allowedRoles={['supervisor', 'admin', 'master_admin']}>
                <SupervisorSiteView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/site-finance"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
                <SiteFinanceView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/requests"
            element={
              <ProtectedRoute allowedRoles={['admin', 'master_admin']}>
                <AdminRequestsView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['master_admin']}>
                <MasterDashboardView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={['master_admin', 'admin', 'supervisor']}>
                <InventoryHubView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit-log"
            element={
              <ProtectedRoute allowedRoles={['master_admin']}>
                <AuditLogView />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
