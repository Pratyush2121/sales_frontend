import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const SiteContext = createContext();

export const SiteProvider = ({ children }) => {
  const { user } = useAuth();
  const [assignedSites, setAssignedSites] = useState([]);
  const [activeSiteId, setActiveSiteId] = useState(() => {
    return localStorage.getItem('sitemaster_active_site_id') || null;
  });
  const [loadingSites, setLoadingSites] = useState(false);

  useEffect(() => {
    if (user) {
      setLoadingSites(true);
      api.get('/sites')
        .then((res) => {
          const sites = res.data || [];
          setAssignedSites(sites);
          if (sites.length > 0) {
            // Check if saved site is valid, otherwise default to first assigned site
            const savedId = localStorage.getItem('sitemaster_active_site_id');
            const match = sites.find((s) => s._id === savedId);
            if (match) {
              setActiveSiteId(match._id);
            } else {
              setActiveSiteId(sites[0]._id);
              localStorage.setItem('sitemaster_active_site_id', sites[0]._id);
            }
          }
        })
        .catch((err) => {
          console.error('Error fetching user sites:', err);
        })
        .finally(() => setLoadingSites(false));
    } else {
      setAssignedSites([]);
      setActiveSiteId(null);
    }
  }, [user]);

  const changeActiveSite = (siteId) => {
    setActiveSiteId(siteId);
    localStorage.setItem('sitemaster_active_site_id', siteId);
  };

  const activeSite = assignedSites.find((s) => s._id === activeSiteId) || assignedSites[0] || null;

  return (
    <SiteContext.Provider
      value={{
        assignedSites,
        activeSiteId,
        activeSite,
        setActiveSiteId: changeActiveSite,
        loadingSites,
        setAssignedSites,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);
