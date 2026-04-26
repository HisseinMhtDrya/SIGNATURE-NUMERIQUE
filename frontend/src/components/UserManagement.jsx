import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/users?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (error) {
      toast.error('Erreur utilisateurs');
    }
    setLoading(false);
  };

  const toggleUser = async (userId) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Statut utilisateur modifié');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur modification');
    }
  };

  const searchUsers = async () => {
    if (!searchTerm) return fetchUsers();
    
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/users/search?q=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      toast.error('Erreur recherche');
    }
  };

  return (
    <div className="users-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="title-icon"><i className="fas fa-users"></i></span>
          Gestion des utilisateurs
        </h2>
        <div className="search-container">
          <div className="search-input-group">
            <div className="search-icon"><i className="fas fa-search"></i></div>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-search"
            />
          </div>
          <button onClick={searchUsers} className="search-btn">
            <span className="btn-icon"> </span>
            Rechercher
          </button>
          <button 
            onClick={() => {setSearchTerm(''); fetchUsers();}} 
            className="reset-btn"
          >
            <span className="btn-icon"> </span>
            Tout afficher
          </button>
        </div>
      </div>

      {/* Tableau moderne */}
      <div className="users-table-container">
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">
                    <span>Utilisateur</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Email</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Rôle</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Statut</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Dernière connexion</span>
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="user-row">
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-info">
                        <span className="user-name">{user.name}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <span className="email-text">{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      <span className="role-icon">
                        {user.role === 'admin' ? ' ' : ' '}
                      </span>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'blocked'}`}>
                      <span className="status-dot"></span>
                      {user.isActive ? 'Actif' : 'Bloqué'}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      {user.lastLogin ? (
                        <>
                          <span className="date-text">
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </span>
                          <span className="time-text">
                            {new Date(user.lastLogin).toLocaleTimeString()}
                          </span>
                        </>
                      ) : (
                        <span className="never-text">Jamais</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className={`action-btn ${user.isActive ? 'block' : 'unblock'}`}
                        onClick={() => toggleUser(user.id)}
                      >
                        <span className="btn-icon">
                          {user.isActive ? '<i className="fas fa-ban"></i>' : '<i className="fas fa-check"></i>'}
                        </span>
                        {user.isActive ? 'Bloquer' : 'Activer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
