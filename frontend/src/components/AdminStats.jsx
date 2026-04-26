import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminStats = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      toast.error('Erreur stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-section">
        <div className="section-title">
          <span className="title-icon"> </span>
          Statistiques globales
        </div>
        <div className="loading-stats">
          <div className="stats-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="stat-card skeleton">
                <div className="stat-icon skeleton-icon"></div>
                <div className="stat-content">
                  <div className="skeleton-number"></div>
                  <p className="skeleton-text"></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-section">
      <h2 className="section-title">
        <span className="title-icon"> </span>
        Statistiques globales
      </h2>
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"> </div>
          <div className="stat-content">
            <h3>{stats.usersActive || 0}</h3>
            <p>Utilisateurs actifs</p>
            <div className="stat-trend">
              <span className="trend-up"> </span>
              <span className="trend-text">En ligne</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon"> </div>
          <div className="stat-content">
            <h3>{stats.admins || 0}</h3>
            <p>Administrateurs</p>
            <div className="stat-trend">
              <span className="trend-stable"> </span>
              <span className="trend-text">Stable</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon"> </div>
          <div className="stat-content">
            <h3>{stats.documents || 0}</h3>
            <p>Documents</p>
            <div className="stat-trend">
              <span className="trend-up"> </span>
              <span className="trend-text">Total</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon"> </div>
          <div className="stat-content">
            <h3>{stats.signatures || 0}</h3>
            <p>Signatures</p>
            <div className="stat-trend">
              <span className="trend-up"> </span>
              <span className="trend-text">Actives</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-icon"> </div>
          <div className="stat-content">
            <h3>{stats.usersBlocked || 0}</h3>
            <p>Utilisateurs bloqués</p>
            <div className="stat-trend">
              <span className="trend-down"> </span>
              <span className="trend-text">Suspendus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;
