import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

console.log('🌟 Fichier UserManagementFinal.jsx chargé');

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(() => {
    console.log("🚀 Initialisation users avec [] safe");
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    console.log('🚀 UserManagement monté - chargement des utilisateurs');
    
    const fetchUsers = async () => {
  try {
    setLoading(true);

    const response = await axios.get(
      `${API_BASE_URL}/users` 
    );

    console.log("✅ API USERS:", response.data);

    // Sécurisation absolue
    const usersData = response?.data?.users;

    // Vérifie que c'est un tableau
    const safeUsers = Array.isArray(usersData)
      ? usersData
      : [];

    // Debug backend
    if (!Array.isArray(usersData)) {
      console.error(
        "❌ users n'est pas un tableau :",
        response.data
      );
    }

    setUsers(safeUsers);

  } catch (error) {
    console.error("❌ Erreur chargement users:", error);

    // sécurité
    setUsers([]);

  } finally {
    setLoading(false);
  }
};

    fetchUsers();
  }, []);

  
  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter');
        return;
      }

      console.log('🗑️ Suppression utilisateur:', userId);

      const response = await axios.delete(
        `http://localhost:5000/api/admin/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Utilisateur supprimé:', response.data);

      setUsers(prevUsers => {
        console.log("🔍 DEBUG prevUsers avant filter:", prevUsers);
        console.log("🔍 DEBUG type prevUsers:", typeof prevUsers);
        console.log("🔍 DEBUG isArray prevUsers:", Array.isArray(prevUsers));
        
        if (!Array.isArray(prevUsers)) {
          console.error("❌ prevUsers n'est pas un tableau:", prevUsers);
          return [];
        }
        
        return prevUsers.filter(user => 
          (user._id !== userId && user.id !== userId)
        );
      });

      alert('Utilisateur supprimé avec succès');
    } catch (err) {
      console.error('❌ Erreur suppression:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
      alert('Erreur lors de la suppression');
    }
  };

  const assignAdminRole = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir attribuer le rôle administrateur à cet utilisateur ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Veuillez vous connecter');
        return;
      }

      console.log('👑 Attribution rôle admin:', userId);

      const response = await axios.put(
        `http://localhost:5000/api/admin/users/${userId}`,
        { role: 'admin' },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Rôle admin attribué:', response.data);

      setUsers(prevUsers => {
        console.log("🔍 DEBUG prevUsers avant map:", prevUsers);
        console.log("🔍 DEBUG type prevUsers:", typeof prevUsers);
        console.log("🔍 DEBUG isArray prevUsers:", Array.isArray(prevUsers));
        
        if (!Array.isArray(prevUsers)) {
          console.error("❌ prevUsers n'est pas un tableau dans assignAdminRole:", prevUsers);
          return [];
        }
        
        return prevUsers.map(user => 
          user._id === userId || user.id === userId 
            ? { ...user, role: 'admin' }
            : user
        );
      });

      alert('Rôle administrateur attribué avec succès');
    } catch (err) {
      console.error('❌ Erreur attribution admin:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Erreur lors de l\'attribution du rôle');
      alert('Erreur lors de l\'attribution du rôle administrateur');
    }
  };

  
  const filteredUsers = useMemo(() => {
    console.log("🔍 DEBUG users dans useMemo:", users);
    console.log("🔍 DEBUG type users:", typeof users);
    console.log("🔍 DEBUG isArray users:", Array.isArray(users));
    
    if (!Array.isArray(users)) {
      console.error("❌ users n'est pas un tableau dans filteredUsers:", users);
      return [];
    }

    return users.filter((user) =>
      user?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||

      user?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  console.log('🎨 UserManagement render - users:', users.length, 'loading:', loading);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px',
          animation: 'spin 2s linear infinite'
        }}>
          ⏳
        </div>
        <div style={{
          fontSize: '18px',
          color: '#666',
          fontWeight: '500'
        }}>
          Chargement des utilisateurs...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          ❌
        </div>
        <div style={{
          fontSize: '18px',
          color: '#dc3545',
          fontWeight: '500',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Debug Info */}
      {debugInfo && (
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>🔍 Debug Info:</strong> {debugInfo}
        </div>
      )}
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            flex: '1',
            minWidth: '300px',
            maxWidth: '500px'
          }}>
            <input
              type="text"
              placeholder="🔍 Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#007bff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd';
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#495057'
            }}>
              Total: {users.length}
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                padding: '12px 20px',
                borderRadius: '8px',
                border: '2px solid #e9ecef',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                }}>
                  👥
                </div>
                <div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: '#1f2937',
                    lineHeight: '1',
                    marginBottom: '4px'
                  }}>
                    {users.length}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Utilisateurs
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <button
                  onClick={() => window.location.href = '/admin/dashboard'}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '700',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    letterSpacing: '0.5px'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  ✨ Retour au Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {filteredUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              opacity: '0.5'
            }}>
              👥
            </div>
            <div style={{
              fontSize: '18px',
              marginBottom: '10px',
              fontWeight: '500'
            }}>
              Aucun utilisateur trouvé
            </div>
            <div style={{
              fontSize: '14px',
              color: '#999'
            }}>
              Commencez par ajouter des utilisateurs
            </div>
          </div>
        ) : (
          <div style={{
            overflowX: 'auto'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    Utilisateur
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    Email
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    Rôle
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    Statut
                  </th>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    borderBottom: '2px solid #dee2e6'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user._id || user.id || index} style={{
                    backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                    borderBottom: '1px solid #dee2e6'
                  }}>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #dee2e6',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#007bff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: '500',
                            color: '#333',
                            marginBottom: '2px'
                          }}>
                            {user?.name || 'Utilisateur'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #dee2e6',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        color: '#666',
                        fontSize: '14px'
                      }}>
                        {user?.email || 'email@exemple.com'}
                      </div>
                    </td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #dee2e6',
                      verticalAlign: 'middle'
                    }}>
                      <span style={{
                        backgroundColor: user?.role === 'admin' ? '#fff3cd' : '#e9ecef',
                        color: user?.role === 'admin' ? '#856404' : '#495057',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {user?.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #dee2e6',
                      verticalAlign: 'middle'
                    }}>
                      <span style={{
                        backgroundColor: user?.isActive ? '#d4edda' : '#f8d7da',
                        color: user?.isActive ? '#155724' : '#721c24',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {user?.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td style={{
                      padding: '12px',
                      borderBottom: '1px solid #dee2e6',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                      }}>
                        {user?.role !== 'admin' && (
                          <button
                            onClick={() => assignAdminRole(user._id || user.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#6f42c1',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            Admin
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(user._id || user.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}
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
    </div>
  );
};

export default UserManagement;
