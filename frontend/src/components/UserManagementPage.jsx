import React from 'react';
import UserManagement from './UserManagement';

const UserManagementPage = () => {
  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-title">
          <h1>
            <span className="crown-icon"> </span>
            Gestion des Utilisateurs
          </h1>
          <p className="admin-subtitle">Gérez les comptes utilisateurs de votre plateforme</p>
        </div>
      </div>
      
      {/* Uniquement la gestion des utilisateurs */}
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;
