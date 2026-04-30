import React, { useState, useEffect } from 'react';
import { FaUsers, FaFilePdf, FaSignature, FaChartBar, FaLock, FaUnlock, FaTrash, FaEdit, FaEye } from 'react-icons/fa';
import axios from 'axios';
import AdminStats from './AdminStats';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [alert, setAlert] = useState({ type: '', message: '' });
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

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
    <div className="min-h-screen bg-gray-100">
      {/* Alert */}
      {alert.message && (
        <div className={`alert alert-${alert.type} fixed top-4 right-4 z-50`} role="alert">
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="crown-icon mr-3">👑</span>
            Panel Administrateur
          </h1>
          <p className="mt-2 opacity-90">Gérez votre plateforme de signature numérique</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Aperçu', icon: FaChartBar },
              { id: 'users', label: 'Utilisateurs', icon: FaUsers },
              { id: 'documents', label: 'Documents', icon: FaFilePdf },
              { id: 'signatures', label: 'Signatures', icon: FaSignature }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <AdminStats stats={stats} />
                
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Activité récente</h2>
                  <div className="space-y-3">
                    {stats.recentActivity?.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <FaSignature className="text-blue-600 mr-3" />
                          <div>
                            <p className="font-medium">{activity.user?.name}</p>
                            <p className="text-sm text-gray-600">
                              a signé "{activity.document?.name}"
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.signedAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )) || (
                      <p className="text-gray-500">Aucune activité récente</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Ajouter un utilisateur
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dernière connexion
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Actif' : 'Bloqué'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleUserStatus(user._id)}
                                className={`p-1 rounded ${
                                  user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                                }`}
                                title={user.isActive ? 'Bloquer' : 'Débloquer'}
                              >
                                {user.isActive ? <FaLock /> : <FaUnlock />}
                              </button>
                              <button className="text-blue-600 hover:text-blue-900 p-1" title="Voir">
                                <FaEye />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900 p-1" title="Éditer">
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => deleteUser(user._id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Gestion des documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((doc) => (
                    <div key={doc._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <FaFilePdf className="text-red-500 text-2xl" />
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          doc.status === 'signed' ? 'bg-green-100 text-green-800' : 
                          doc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.status || 'En attente'}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 truncate mb-2">{doc.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Propriétaire: {doc.owner?.name || 'Inconnu'}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Signatures Tab */}
            {activeTab === 'signatures' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Audit des signatures</h2>
                <div className="text-center py-12">
                  <FaSignature className="text-gray-300 text-6xl mx-auto mb-4" />
                  <p className="text-gray-500">Fonctionnalité d'audit en développement</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
