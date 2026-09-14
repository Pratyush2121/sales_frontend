import React, { createContext, useContext, useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';

const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
  const [appName, setAppName] = useState(() => {
    return localStorage.getItem('crm_app_name') || 'SiteMaster Pro';
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(appName);

  useEffect(() => {
    localStorage.setItem('crm_app_name', appName);
    document.title = appName;
  }, [appName]);

  const handleSave = () => {
    if (tempName.trim()) {
      setAppName(tempName.trim());
      setIsEditing(false);
    }
  };

  return (
    <BrandingContext.Provider value={{ appName, setAppName, setIsEditing }}>
      {children}

      {/* Dynamic Branding Edit Modal */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.25rem',
            maxWidth: '380px',
            width: '100%',
            color: '#0f172a',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a' }}>
              <Edit3 size={18} color="#2563eb" /> Edit Project Name
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
              Enter custom title for your application:
            </p>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="input-field"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                marginBottom: '1rem',
                borderRadius: '6px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontSize: '0.9rem',
              }}
              placeholder="e.g. AMJP Buildcon CRM"
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="btn btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);

export const AppName = ({ showEditBtn = false }) => {
  const { appName, setIsEditing } = useBranding();
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
      <span>{appName}</span>
      {showEditBtn && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '2px',
            display: 'inline-flex',
            alignItems: 'center',
          }}
          title="Edit Name"
        >
          <Edit3 size={13} />
        </button>
      )}
    </span>
  );
};
