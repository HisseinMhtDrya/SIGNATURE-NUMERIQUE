import React from 'react';
import AdminStats from './AdminStats';

const AdminStatsPage = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-title">
          <h1>
            <span className="crown-icon"> </span>
            Tableau de bord Admin
          </h1>
          <p className="admin-subtitle">Statistiques globales de votre plateforme</p>
        </div>
      </div>
      
      {/* Uniquement les statistiques globales */}
      <AdminStats />
    </div>
  );
};

export default AdminStatsPage;
