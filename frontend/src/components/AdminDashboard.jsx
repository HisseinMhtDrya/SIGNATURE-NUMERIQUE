import React, { useState, useEffect } from 'react';
import { 
  FaUsers, FaFilePdf, FaSignature, FaChartBar, FaTrash, FaEdit, FaEye, 
  FaUserShield, FaClock, FaChartLine, FaDownload, FaUpload, FaCheckCircle, 
  FaExclamationTriangle, FaSearch, FaFilter, FaPlus, FaBell, FaCog, FaSignOutAlt,
  FaCaretDown, FaBan, FaCheck, FaEllipsisV
} from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import AdminStats from './AdminStats';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  // Forcer recompilation - Bouton Actions amélioré
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      setUsers(users.filter(user => user._id !== userId));
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
            {/* Overview Tab - Design Moderne */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Utilisateurs Total</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                        <div className="flex items-center mt-2 text-green-600 text-sm">
                          <FaChartLine className="mr-1" />
                          <span>+12% ce mois</span>
                        </div>
                      </div>
                      <div className="bg-blue-100 p-4 rounded-lg">
                        <FaUsers className="text-blue-600 text-2xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Documents</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalDocuments || 0}</p>
                        <div className="flex items-center mt-2 text-green-600 text-sm">
                          <FaTrendingUp className="mr-1" />
                          <span>+8% ce mois</span>
                        </div>
                      </div>
                      <div className="bg-red-100 p-4 rounded-lg">
                        <FaFilePdf className="text-red-600 text-2xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Signatures</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.totalSignatures || 0}</p>
                        <div className="flex items-center mt-2 text-green-600 text-sm">
                          <FaTrendingUp className="mr-1" />
                          <span>+25% ce mois</span>
                        </div>
                      </div>
                      <div className="bg-green-100 p-4 rounded-lg">
                        <FaSignature className="text-green-600 text-2xl" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Actifs Aujourd'hui</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.activeToday || 0}</p>
                        <div className="flex items-center mt-2 text-blue-600 text-sm">
                          <FaClock className="mr-1" />
                          <span>En temps réel</span>
                        </div>
                      </div>
                      <div className="bg-purple-100 p-4 rounded-lg">
                        <FaChartBar className="text-purple-600 text-2xl" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Activité Récente</h2>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Voir tout
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {stats.recentActivity?.map((activity, index) => (
                      <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <FaSignature className="text-blue-600 text-lg" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{activity.user?.name}</p>
                              <p className="text-sm text-gray-600">
                                a signé "<span className="font-medium">{activity.document?.name}</span>"
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(activity.signedAt).toLocaleDateString('fr-FR')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(activity.signedAt).toLocaleTimeString('fr-FR')}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.signedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )) || (
                      <div className="p-12 text-center">
                        <FaSignature className="text-gray-300 text-5xl mx-auto mb-4" />
                        <p className="text-gray-500">Aucune activité récente</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab - Design Moderne */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Header avec recherche et filtres */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Gestion des Utilisateurs</h2>
                      <p className="text-sm text-gray-600 mt-1">{users.length} utilisateurs au total</p>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Barre de recherche */}
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      {/* Bouton d'action */}
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <FaPlus />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tableau des utilisateurs moderne */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rôle
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dernière connexion
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {user.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive ? '✅ Actif' : '❌ Bloqué'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <FaClock className="mr-2 text-gray-400" />
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }).replace(',', ' à') : 'Jamais'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
  <div className="relative dropdown-container">
    {/* BOUTON PRINCIPAL - MODERNE */}
    <button
      onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}
      className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-300 active:scale-95 transition-all duration-200 flex items-center space-x-2 shadow-sm border border-gray-200 hover:shadow-md group"
    >
      <FaEllipsisV className="text-sm" />
      <span className="font-medium">Actions</span>
      <FaCaretDown className={`text-xs transform transition-transform duration-200 ${dropdownOpen === user._id ? 'rotate-180' : ''}`} />
    </button>
    
    {/* MENU DROPDOWN - DESIGN MODERNE */}
    {dropdownOpen === user._id && (
      <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 z-20 animate-in slide-in-from-top-2 duration-200">
        
        {/* BOUTON ACTIVER/DESACTIVER - AVEC ICONES REACT ICONS */}
        <button
          onClick={() => {
            toggleUserStatus(user._id);
            setDropdownOpen(null);
          }}
          className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 group/item flex items-center space-x-3 transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
            user.isActive 
              ? 'text-red-600 hover:text-red-700 hover:shadow-sm hover:shadow-red-100' 
              : 'text-green-600 hover:text-green-700 hover:shadow-sm hover:shadow-green-100'
          }`}
        >
          {user.isActive ? <FaBan className="text-red-500 text-lg" /> : <FaCheck className="text-green-500 text-lg" />}
          <div className="flex-1">
            <span>{user.isActive ? 'Bloquer' : 'Activer'}</span>
            <p className={`text-xs opacity-75 ${user.isActive ? 'text-red-500' : 'text-green-500'}`}>
              {user.isActive ? 'Désactive le compte' : 'Active le compte'}
            </p>
          </div>
        </button>
        
        {/* BOUTON VOIR */}
        <button
          onClick={() => {
            setDropdownOpen(null);
            // Ajoute ta logique pour "Voir"
          }}
          className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 group/item flex items-center space-x-3 transition-all duration-200 border-b border-gray-50 last:border-b-0 hover:text-blue-700 hover:shadow-sm hover:shadow-blue-100"
        >
          <FaEye className="text-blue-500 text-lg" />
          <div className="flex-1">
            <span>Voir</span>
            <p className="text-xs opacity-75 text-gray-500">Consulter le profil</p>
          </div>
        </button>
        
        {/* BOUTON ÉDITER */}
        <button
          onClick={() => {
            setDropdownOpen(null);
            // Ajoute ta logique pour "Éditer"
          }}
          className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 group/item flex items-center space-x-3 transition-all duration-200 border-b border-gray-50 last:border-b-0 hover:text-gray-800 hover:shadow-sm hover:shadow-gray-100"
        >
          <FaEdit className="text-gray-500 text-lg group-hover/item:text-gray-700" />
          <div className="flex-1">
            <span>Éditer</span>
            <p className="text-xs opacity-75 text-gray-500">Modifier les infos</p>
          </div>
        </button>
        
        {/* BOUTON SUPPRIMER */}
        <button
          onClick={() => {
            deleteUser(user._id);
            setDropdownOpen(null);
          }}
          className="w-full px-4 py-3 text-left text-sm font-medium hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 group/item flex items-center space-x-3 transition-all duration-200 hover:text-red-700 hover:shadow-sm hover:shadow-red-100"
        >
          <FaTrash className="text-red-500 text-lg" />
          <div className="flex-1">
            <span>Supprimer</span>
            <p className="text-xs opacity-75 text-red-500">Suppression définitive</p>
          </div>
        </button>
      </div>
    )}
  </div>
</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
