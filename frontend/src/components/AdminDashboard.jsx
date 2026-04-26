import React from 'react';
import AdminStats from './AdminStats';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-title">
          <h1>
            <span className="crown-icon"> </span>
            Panel Administrateur
          </h1>
          <p className="admin-subtitle">Gérez votre plateforme de signature numérique</p>
        </div>
      </div>
      
      {/* Statistiques globales */}
      <AdminStats />
      
      {/* Gestion des utilisateurs */}
      <UserManagement />
    </div>
  );
};

export default AdminDashboard;
