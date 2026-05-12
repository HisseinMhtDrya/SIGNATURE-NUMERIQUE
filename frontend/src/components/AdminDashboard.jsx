import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaUsers, FaFilePdf, FaSignature, FaChartBar, FaTrash, FaEdit, FaEye, 
  FaUserShield, FaClock, FaChartLine, FaDownload, FaUpload, FaCheckCircle, 
  FaExclamationTriangle, FaSearch, FaFilter, FaPlus, FaBell, FaCog, FaSignOutAlt,
  FaCaretDown, FaBan, FaCheck, FaEllipsisV, FaFileAlt, FaShieldAlt, FaUserCircle, FaTimes, FaUser, FaCrown, FaTimesCircle, FaUserPlus, FaHome
} from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import AdminStats from './AdminStats';
import UserManagement from './UserManagement';
import './AdminDashboardModern.css';
import './AdminDashboardStats.css';
import './AdminDashboardHome.css';

const AdminDashboard = () => {
  // Forcer recompilation - Bouton Actions amélioré
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      console.error("❌ users n'est pas un tableau dans AdminDashboard:", users);
      return [];
    }
    return users.filter(user => 
      user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const filteredDocuments = useMemo(() => {
    if (!Array.isArray(documents)) {
      console.error("❌ documents n'est pas un tableau dans AdminDashboard:", documents);
      return [];
    }
    return documents.filter(doc =>
      doc?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  const API_URL = API_BASE_URL;

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.dropdown-container')) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (activeTab === 'overview' || activeTab === 'stats') {
        const statsResponse = await axios.get(`${API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsResponse.data);
      }
      
      if (activeTab === 'users') {
        const usersResponse = await axios.get(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(usersResponse.data.users || []);
      }
      
      if (activeTab === 'documents') {
        const docsResponse = await axios.get(`${API_URL}/admin/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocuments(docsResponse.data);
      }
    } catch (error) {
      showAlert('danger', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 3000);
  };

  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/admin/users/${userId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !user.isActive } : user
      ));
      showAlert('success', 'Statut utilisateur mis à jour');
    } catch (error) {
      showAlert('danger', 'Erreur lors de la mise à jour');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(prevUsers => {
        if (!Array.isArray(prevUsers)) {
          console.error("❌ prevUsers n'est pas un tableau dans deleteUser AdminDashboard:", prevUsers);
          return [];
        }
        return prevUsers.filter(user => user._id !== userId);
      });
      showAlert('success', 'Utilisateur supprimé');
    } catch (error) {
      showAlert('danger', 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Alert */}
      {alert.message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          alert.type === 'success' ? 'bg-green-500 text-white' : 
          alert.type === 'danger' ? 'bg-red-500 text-white' : 
          'bg-blue-500 text-white'
        }`}>
          <div className="flex items-center">
            {alert.type === 'success' && <FaCheckCircle className="mr-2" />}
            {alert.type === 'danger' && <FaExclamationTriangle className="mr-2" />}
            {alert.message}
          </div>
        </div>
      )}

      {/* Header Professionnel */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <FaUserShield className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel Administrateur</h1>
                <p className="text-sm text-gray-600">Plateforme de Signature Numérique</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaBell className="text-xl" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      <div className="p-4 hover:bg-gray-50 border-b border-gray-100">
                        <p className="text-sm text-gray-800">Nouvel utilisateur inscrit</p>
                        <p className="text-xs text-gray-500 mt-1">Il y a 5 minutes</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50">
                        <p className="text-sm text-gray-800">Document signé</p>
                        <p className="text-xs text-gray-500 mt-1">Il y a 1 heure</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Paramètres */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <FaCog className="text-xl" />
              </button>

              {/* Déconnexion */}
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <FaSignOutAlt />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs Modernes */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: FaHome },
              { id: 'overview', label: 'Aperçu', icon: FaChartBar },
              { id: 'users', label: 'Utilisateurs', icon: FaUsers },
              { id: 'documents', label: 'Documents', icon: FaFilePdf },
              { id: 'signatures', label: 'Signatures', icon: FaSignature }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className={`mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="ml-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <>
            {/* Dashboard Tab - Page d'accueil originale */}
            {activeTab === 'dashboard' && (
              <div className="admin-dashboard-home">
                {/* Header avec statistiques */}
                <div className="dashboard-header">
                  <div className="welcome-section">
                    <h1 className="welcome-title">
                      <span className="welcome-text">Bienvenue</span>
                      <span className="user-name">Admin Signature</span>
                    </h1>
                    <p className="dashboard-subtitle">Gérez vos documents et signatures numériques</p>
                  </div>
                  <div className="stats-cards">
                    <div className="stat-card">
                      <div className="stat-icon">📄</div>
                      <div className="stat-info">
                        <h3>{documents.length}</h3>
                        <p>Documents</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">✍️</div>
                      <div className="stat-info">
                        <h3>{stats.totalSignatures || 0}</h3>
                        <p>Signatures</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Upload */}
                <div className="upload-section">
                  <h2 className="section-title">
                    <span className="title-icon">📤</span>
                    Ajouter un document
                  </h2>
                  <div className="upload-zone">
                    <div className="upload-content">
                      <div className="upload-icon">📁</div>
                      <h3>Aucun fichier n'a été sélectionné</h3>
                      <p>Glissez-déposez votre document ici ou cliquez pour parcourir vos fichiers</p>
                    </div>
                  </div>
                </div>

                {/* Section Documents */}
                <div className="documents-section">
                  <h2 className="section-title">
                    <span className="title-icon">📋</span>
                    Documents récents
                  </h2>
                  <div className="documents-grid">
                    {filteredDocuments.slice(0, 6).map((doc) => (
                      <div key={doc._id} className="document-card">
                        <div className="document-header">
                          <div className="document-icon">📄</div>
                          <div className="document-info">
                            <h4>{doc.name}</h4>
                            <p>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <div className="document-actions">
                          <button className="action-btn primary">Voir</button>
                          <button className="action-btn secondary">Télécharger</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Overview Tab - Design Ultra Moderne */}
            {activeTab === 'overview' && (
              <div className="admin-dashboard-modern">
                {/* Header avec statistiques globales */}
                <div className="stats-header-modern">
                  <div className="stats-header-content">
                    <h2 className="stats-main-title">
                      <FaChartBar className="title-icon-stats" />
                      Statistiques globales de votre plateforme
                    </h2>
                    <p className="stats-subtitle">
                      Vue d'ensemble en temps réel de l'activité de votre plateforme
                    </p>
                  </div>
                  
                  <div className="stats-controls">
                    <button className="refresh-btn-modern">
                      <FaClock />
                      <span>Mettre à jour</span>
                    </button>
                    <button className="export-btn-modern">
                      <FaDownload />
                      <span>Exporter</span>
                    </button>
                  </div>
                </div>

                {/* Grille de statistiques moderne */}
                <div className="stats-grid-modern">
                  {/* Carte Utilisateurs Actifs */}
                  <div className="stat-card-modern users">
                    <div className="stat-card-header">
                      <div className="stat-icon-container users">
                        <FaUsers className="stat-icon" />
                        <div className="stat-icon-bg"></div>
                      </div>
                      <div className="stat-badge">
                        <span className="badge-text">En ligne</span>
                      </div>
                    </div>
                    
                    <div className="stat-content">
                      <div className="stat-number-container">
                        <span className="stat-number">{stats.totalUsers || 0}</span>
                        <span className="stat-unit">utilisateurs</span>
                      </div>
                      <div className="stat-description">
                        <span className="stat-label">Utilisateurs actifs</span>
                        <div className="stat-trend positive">
                          <FaChartLine />
                          <span>+12% ce mois</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="stat-progress">
                      <div className="progress-bar">
                        <div className="progress-fill users" style={{ width: '75%' }}></div>
                      </div>
                      <span className="progress-text">75% d'activité</span>
                    </div>
                  </div>

                  {/* Carte Administrateurs */}
                  <div className="stat-card-modern admins">
                    <div className="stat-card-header">
                      <div className="stat-icon-container admins">
                        <FaUserShield className="stat-icon" />
                        <div className="stat-icon-bg"></div>
                      </div>
                      <div className="stat-badge premium">
                        <span className="badge-text">Premium</span>
                      </div>
                    </div>
                    
                    <div className="stat-content">
                      <div className="stat-number-container">
                        <span className="stat-number">{Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0}</span>
                        <span className="stat-unit">administrateurs</span>
                      </div>
                      <div className="stat-description">
                        <span className="stat-label">Équipe d'administration</span>
                        <div className="stat-trend stable">
                          <FaClock />
                          <span>Stable</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="stat-progress">
                      <div className="progress-bar">
                        <div className="progress-fill admins" style={{ width: '20%' }}></div>
                      </div>
                      <span className="progress-text">20% du total</span>
                    </div>
                  </div>

                  {/* Carte Documents */}
                  <div className="stat-card-modern documents">
                    <div className="stat-card-header">
                      <div className="stat-icon-container documents">
                        <FaFilePdf className="stat-icon" />
                        <div className="stat-icon-bg"></div>
                      </div>
                      <div className="stat-badge">
                        <span className="badge-text">Total</span>
                      </div>
                    </div>
                    
                    <div className="stat-content">
                      <div className="stat-number-container">
                        <span className="stat-number">{stats.totalDocuments || 0}</span>
                        <span className="stat-unit">documents</span>
                      </div>
                      <div className="stat-description">
                        <span className="stat-label">Documents stockés</span>
                        <div className="stat-trend positive">
                          <FaChartLine />
                          <span>+8% ce mois</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="stat-progress">
                      <div className="progress-bar">
                        <div className="progress-fill documents" style={{ width: '60%' }}></div>
                      </div>
                      <span className="progress-text">60% d'espace utilisé</span>
                    </div>
                  </div>

                  {/* Carte Signatures */}
                  <div className="stat-card-modern signatures">
                    <div className="stat-card-header">
                      <div className="stat-icon-container signatures">
                        <FaSignature className="stat-icon" />
                        <div className="stat-icon-bg"></div>
                      </div>
                      <div className="stat-badge">
                        <span className="badge-text">Actives</span>
                      </div>
                    </div>
                    
                    <div className="stat-content">
                      <div className="stat-number-container">
                        <span className="stat-number">{stats.totalSignatures || 0}</span>
                        <span className="stat-unit">signatures</span>
                      </div>
                      <div className="stat-description">
                        <span className="stat-label">Signatures validées</span>
                        <div className="stat-trend positive">
                          <FaChartLine />
                          <span>+25% ce mois</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="stat-progress">
                      <div className="progress-bar">
                        <div className="progress-fill signatures" style={{ width: '85%' }}></div>
                      </div>
                      <span className="progress-text">85% de succès</span>
                    </div>
                  </div>
                </div>

                {/* Section d'activité récente */}
                <div className="activity-section-modern">
                  <div className="activity-header">
                    <h3 className="activity-title">
                      <FaClock className="activity-icon" />
                      Activité Récente
                    </h3>
                    <button className="view-all-btn">
                      Voir tout
                    </button>
                  </div>
                  
                  <div className="activity-grid">
                    {stats.recentActivity?.slice(0, 3).map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-avatar">
                          <span>{activity.user?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                        <div className="activity-content">
                          <p className="activity-text">{activity.action}</p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                        <div className="activity-indicator"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab - Design Ultra Moderne */}
            {activeTab === 'users' && (
              <div className="users-management-modern">
                {/* Header avec statistiques */}
                <div className="users-header-modern">
                  <div className="users-header-content">
                    <div className="users-title-section">
                      <h2 className="users-main-title">
                        <FaUsers className="title-icon-users" />
                        Gestion des Utilisateurs
                      </h2>
                      <p className="users-subtitle">
                        Gérez les comptes utilisateurs de votre plateforme
                      </p>
                    </div>
                    
                    <div className="users-stats">
                      <div className="stat-card-modern">
                        <div className="stat-icon-modern total">
                          <FaUsers />
                        </div>
                        <div className="stat-info-modern">
                          <span className="stat-number">{users.length}</span>
                          <span className="stat-label">Total</span>
                        </div>
                      </div>
                      <div className="stat-card-modern">
                        <div className="stat-icon-modern active">
                          <FaCheckCircle />
                        </div>
                        <div className="stat-info-modern">
                          <span className="stat-number">{Array.isArray(users) ? users.filter(u => u.isActive).length : 0}</span>
                          <span className="stat-label">Actifs</span>
                        </div>
                      </div>
                      <div className="stat-card-modern">
                        <div className="stat-icon-modern blocked">
                          <FaBan />
                        </div>
                        <div className="stat-info-modern">
                          <span className="stat-number">{Array.isArray(users) ? users.filter(u => !u.isActive).length : 0}</span>
                          <span className="stat-label">Bloqués</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="users-controls">
                    <div className="search-container-modern">
                      <FaSearch className="search-icon-modern" />
                      <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-modern"
                      />
                    </div>
                    
                    <button className="add-user-btn-modern">
                      <FaUserPlus />
                      <span>Ajouter un utilisateur</span>
                    </button>
                  </div>
                </div>

                {/* Grille des utilisateurs moderne */}
                <div className="users-grid-modern">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="user-card-modern">
                      {/* Header de la carte utilisateur */}
                      <div className="user-card-header">
                        <div className="user-avatar-modern">
                          <div className="avatar-circle">
                            <span className="avatar-text">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div className={`status-indicator ${user.isActive ? 'active' : 'blocked'}`}>
                            <div className="status-dot"></div>
                          </div>
                        </div>
                        
                        <div className="user-info-modern">
                          <h3 className="user-name">{user.name}</h3>
                          <p className="user-email">{user.email}</p>
                          
                          <div className="user-badges">
                            <span className={`role-badge ${user.role}`}>
                              {user.role === 'admin' ? (
                                <>
                                  <FaCrown />
                                  <span>Administrateur</span>
                                </>
                              ) : (
                                <>
                                  <FaUser />
                                  <span>Utilisateur</span>
                                </>
                              )}
                            </span>
                            
                            <span className={`status-badge ${user.isActive ? 'active' : 'blocked'}`}>
                              {user.isActive ? (
                                <>
                                  <FaCheckCircle />
                                  <span>Actif</span>
                                </>
                              ) : (
                                <>
                                  <FaTimesCircle />
                                  <span>Bloqué</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Détails de l'utilisateur */}
                      <div className="user-details-modern">
                        <div className="detail-item">
                          <FaClock className="detail-icon" />
                          <div className="detail-content">
                            <span className="detail-label">Dernière connexion</span>
                            <span className="detail-value">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }).replace(',', ' à') : 'Jamais'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions modernes */}
                      <div className="user-actions-modern">
                        <button 
                          onClick={() => toggleUserStatus(user._id)}
                          className={`action-btn-modern ${user.isActive ? 'block' : 'activate'}`}
                        >
                          {user.isActive ? <FaBan /> : <FaCheckCircle />}
                          <span>{user.isActive ? 'Bloquer' : 'Activer'}</span>
                        </button>
                        
                        <button className="action-btn-modern view">
                          <FaEye />
                          <span>Voir</span>
                        </button>
                        
                        <button className="action-btn-modern edit">
                          <FaEdit />
                          <span>Éditer</span>
                        </button>
                        
                        <button 
                          onClick={() => deleteUser(user._id)}
                          className="action-btn-modern delete"
                        >
                          <FaTrash />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents Tab - Design Moderne */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Gestion des Documents</h2>
                      <p className="text-sm text-gray-600 mt-1">{documents.length} documents au total</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <FaUpload />
                        <span>Uploader</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Grille de documents moderne */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDocuments.map((doc) => (
                    <div key={doc._id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                      {/* Header du document */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-red-100 p-3 rounded-lg group-hover:scale-110 transition-transform">
                            <FaFilePdf className="text-red-600 text-xl" />
                          </div>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            doc.status === 'signed' ? 'bg-green-100 text-green-800' : 
                            doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {doc.status === 'signed' ? '✅ Signé' : 
                             doc.status === 'pending' ? '⏳ En attente' : 
                             '📄 Brouillon'}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 truncate mb-2 group-hover:text-blue-600 transition-colors">
                          {doc.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          Propriétaire: <span className="font-medium">{doc.owner?.name || 'Inconnu'}</span>
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaDownload className="mr-1" />
                            <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                          <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="p-4 bg-gray-50 flex items-center justify-between">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Voir détails
                        </button>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                            <FaDownload />
                          </button>
                          <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                            <FaEye />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signatures Tab - Design Moderne */}
            {activeTab === 'signatures' && (
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center py-12">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaSignature className="text-blue-600 text-4xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Audit des Signatures</h3>
                  <p className="text-gray-600 mb-6">Cette fonctionnalité est en cours de développement</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <FaExclamationTriangle />
                    <span>Bientôt disponible</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
