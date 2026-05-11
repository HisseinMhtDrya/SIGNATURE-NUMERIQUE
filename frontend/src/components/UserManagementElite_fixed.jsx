import React, { useState, useEffect } from 'react';
import axios from 'axios';

console.log('­ƒöì Fichier UserManagementElite.jsx charg├®');

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    console.log('­ƒÜÇ UserManagement mont├® - chargement des utilisateurs');
    
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Veuillez vous connecter');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Ô£à R├®ponse API compl├¿te:', response.data);
        console.log('Ô£à Utilisateurs charg├®s:', response.data.users);
        setUsers(response.data.users || []);
        setError('');
      } catch (err) {
        console.error('ÔØî Erreur:', err.response?.data?.error || err.message);
        setError(err.response?.data?.error || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5000/api/admin/users/${userId}/toggle`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId || user.id === userId 
            ? { ...user, isActive: !user.isActive }
            : user
        )
      );
      setError('Statut modifi├® avec succ├¿s');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du changement de statut');
    }
  };

  const editUser = (userId) => {
    console.log('­ƒôØ Modifier utilisateur:', userId);
    alert('Fonction de modification ├á impl├®menter');
  };

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    isActive: true
  });

  const createUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/admin/users', newUser, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUsers(prevUsers => [...prevUsers, response.data.user]);
      setShowCreateModal(false);
      setNewUser({ name: '', email: '', password: '', role: 'user', isActive: true });
      setError('Utilisateur cr├®├® avec succ├¿s');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la cr├®ation');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('├ètes-vous s├╗r de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUsers(prevUsers => prevUsers.filter(user => (user._id !== userId && user.id !== userId)));
      setError('Utilisateur supprim├® avec succ├¿s');
      setTimeout(() => setError(''), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user?.role === roleFilter;
    const matchesStatus = !statusFilter || user?.isActive.toString() === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (isActive) => ({
    backgroundColor: isActive ? '#d4edda' : '#f8d7da',
    color: isActive ? '#155724' : '#721c24',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block'
  });

  const getRoleBadge = (role) => ({
    backgroundColor: role === 'admin' ? '#fff3cd' : '#e9ecef',
    color: role === 'admin' ? '#856404' : '#495057',
    padding: '4px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    display: 'inline-block'
  });

  console.log('­ƒöä UserManagement render - users:', users.length, 'loading:', loading);

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Header professionnel */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e9ecef'
      }}>
        <div>
          <h1 style={{ 
            margin: '0', 
            color: '#2c3e50', 
            fontSize: '32px', 
            fontWeight: '300',
            letterSpacing: '-0.5px'
          }}>
            Utilisateurs
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: '#6c757d', 
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '1.5'
          }}>
            Gestion des comptes et permissions d'acc├¿s
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#2c3e50', 
              marginBottom: '8px'
            }}>
              {users.length}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              fontWeight: '500'
            }}>
              Total utilisateurs
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#28a745', 
              marginBottom: '8px'
            }}>
              {filteredUsers.length}
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#6c757d', 
              fontWeight: '500'
            }}>
              Utilisateurs filtr├®s
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'outils */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '320px', maxWidth: '480px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#6c757d', 
              pointerEvents: 'none'
            }}>
              ­ƒöì
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px 12px 12px 40px',
                border: '1px solid #e4e7ea',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#007bff';
                e.target.style.boxShadow = '0 0 0 4px rgba(0,123,255,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e4e7ea';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid #e4e7ea',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '160px'
            }}
          >
            <option value="">Tous les r├┤les</option>
            <option value="admin">Administrateurs</option>
            <option value="user">Utilisateurs</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid #e4e7ea',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '160px'
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,123,255,0.15)',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            + Cr├®er un utilisateur
          </button>

          {/* Modal de cr├®ation */}
          {showCreateModal && (
            <div style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: '1000'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                width: '90%',
                maxWidth: '500px',
                boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
              }}>
                <h2 style={{ 
                  margin: '0 0 24px 0', 
                  color: '#2c3e50', 
                  fontSize: '24px',
                  fontWeight: '600'
                }}>
                  Cr├®er un utilisateur
                </h2>
                
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      color: '#495057', 
                      fontWeight: '500',
                      fontSize: '14px'
                    }}>
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e4e7ea',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      color: '#495057', 
                      fontWeight: '500', 
                      fontSize: '14px'
                    }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e4e7ea',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      color: '#495057', 
                      fontWeight: '500', 
                      fontSize: '14px'
                    }}>
                      R├┤le
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #e4e7ea',
                        borderRadius: '6px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '8px', 
                      color: '#495057', 
                      fontWeight: '500', 
                      fontSize: '14px'
                    }}>
                      <input
                        type="checkbox"
                        checked={newUser.isActive}
                        onChange={(e) => setNewUser({...newUser, isActive: e.target.checked})}
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{ marginLeft: '4px' }}>
                        Compte actif
                      </span>
                    </label>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  marginTop: '24px'
                }}>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      padding: '12px 24px',
                      border: '1px solid #e4e7ea',
                      borderRadius: '6px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    >
                    Annuler
                  </button>
                  <button
                    onClick={createUser}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 8px rgba(0,123,255,0.15)'
                    }}
                    >
                      Cr├®er
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* Messages */}
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          color: '#991b1b', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          borderLeft: '4px solid #dc3545',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>ÔÜá´©Å</span>
          <span>{error}</span>
        </div>
      )}

      {/* Tableau */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ 
            display: 'inline-block', 
            padding: '24px 32px', 
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #e4e7ea',
              borderTop: '3px solid #007bff',
              borderRight: '3px solid #007bff',
              borderBottom: '3px solid #007bff',
              borderRadius: '50%',
              borderTopLeftRadius: '8px',
              borderBottomLeftRadius: '8px',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{ marginTop: '16px', color: '#6c757d' }}>
              Chargement des utilisateurs...
            </div>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '100px 40px', 
          color: '#6c757d'
        }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '24px',
            opacity: '0.3'
          }}>
            ­ƒöì
          </div>
          <h3 style={{ 
            color: '#495057', 
            marginBottom: '24px',
            fontWeight: '600'
          }}>
            Aucun utilisateur trouv├®
          </h3>
          <p style={{ 
            color: '#6c757d', 
            fontSize: '16px',
            lineHeight: '1.5',
            maxWidth: '400px'
          }}>
            {searchTerm || roleFilter || statusFilter 
              ? 'Aucun utilisateur ne correspond ├á vos crit├¿res de recherche.'
              : 'Aucun utilisateur enregistr├® dans le syst├¿me.'}
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ 
                  padding: '20px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#495057', 
                  fontSize: '14px',
                  borderBottom: '2px solid #dee2e6',
                  letterSpacing: '0.5px'
                }}>Utilisateur</th>
                <th style={{ 
                  padding: '20px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#495057', 
                  fontSize: '14px',
                  borderBottom: '2px solid #dee2e6',
                  letterSpacing: '0.5px'
                }}>Email</th>
                <th style={{ 
                  padding: '20px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#495057', 
                  fontSize: '14px',
                  borderBottom: '2px solid #dee2e6',
                  letterSpacing: '0.5px'
                }}>R├┤le</th>
                <th style={{ 
                  padding: '20px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#495057', 
                  fontSize: '14px',
                  borderBottom: '2px solid #dee2e6',
                  letterSpacing: '0.5px'
                }}>Statut</th>
                <th style={{ 
                  padding: '20px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#495057', 
                  fontSize: '14px',
                  borderBottom: '2px solid #dee2e6',
                  letterSpacing: '0.5px'
                }}>Derni├¿re connexion</th>
                <th style={{ 
                  padding: '20px 16px', 
                  textAlign: 'left', 
                  fontWeight: '600', 
                  color: '#495057', 
                  fontSize: '14px',
                  borderBottom: '2px solid #dee2e6',
                  letterSpacing: '0.5px'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user._id || user.id || index} style={{ 
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                  transition: 'background-color 0.2s ease'
                }}>
                  <td style={{ 
                    padding: '20px 16px', 
                    borderBottom: '1px solid #e9ecef', 
                    verticalAlign: 'middle'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        background: '#ffffff',
                        border: '2px solid #e9ecef',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '20px',
                        color: '#6c757d',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div style={{ marginLeft: '16px' }}>
                        <div style={{ 
                          fontWeight: '600', 
                          color: '#2c3e50', 
                          marginBottom: '4px',
                          fontSize: '16px'
                        }}>
                          {user?.name || 'Utilisateur'}
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          color: '#6c757d',
                          marginBottom: '4px'
                        }}>
                          {user?.email || 'email@exemple.com'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ 
                    padding: '20px 16px', 
                    borderBottom: '1px solid #e9ecef', 
                    verticalAlign: 'middle'
                  }}>
                    <span style={getRoleBadge(user?.role)}>
                      {user?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '20px 16px', 
                    borderBottom: '1px solid #e9ecef', 
                    verticalAlign: 'middle'
                  }}>
                    <span style={getStatusBadge(user?.isActive)}>
                      {user?.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '20px 16px', 
                    borderBottom: '1px solid #e9ecef', 
                    verticalAlign: 'middle',
                    fontSize: '14px',
                    color: '#6c757d'
                  }}>
                    {user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('fr-FR', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        }) + ' ├á ' + new Date(user.lastLogin).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })
                      : 'Jamais'}
                  </td>
                  <td style={{ 
                    padding: '20px 16px', 
                    borderBottom: '1px solid #e9ecef', 
                    verticalAlign: 'middle'
                  }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        style={{
                          padding: '10px 16px',
                          fontSize: '13px',
                          border: '1px solid #e4e7ea',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          color: '#6c757d',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#f8f9fa';
                          e.target.style.borderColor = '#007bff';
                          e.target.style.color = '#007bff';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.borderColor = '#e4e7ea';
                          e.target.style.color = '#6c757d';
                        }}
                        onClick={() => editUser(user._id || user.id)}
                      >
                        Modifier
                      </button>
                      <button
                        style={{
                          padding: '10px 16px',
                          fontSize: '13px',
                          border: '1px solid #e4e7ea',
                          borderRadius: '6px',
                          backgroundColor: user?.isActive ? '#28a745' : '#dc3545',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#f8f9fa';
                          e.target.style.borderColor = user?.isActive ? '#218838' : '#ffc107';
                          e.target.style.color = '#ffffff';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = user?.isActive ? '#28a745' : '#dc3545';
                          e.target.style.borderColor = '#e4e7ea';
                          e.target.style.color = '#ffffff';
                        }}
                        onClick={() => toggleUserStatus(user._id || user.id)}
                      >
                        {user?.isActive ? 'D├®sactiver' : 'Activer'}
                      </button>
                      <button
                        style={{
                          padding: '10px 16px',
                          fontSize: '13px',
                          border: '1px solid #e4e7ea',
                          borderRadius: '6px',
                          backgroundColor: '#dc3545',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#f8f9fa';
                          e.target.style.borderColor = '#c82333';
                          e.target.style.color = '#ffffff';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#dc3545';
                          e.target.style.borderColor = '#e4e7ea';
                          e.target.style.color = '#ffffff';
                        }}
                        onClick={() => deleteUser(user._id || user.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

