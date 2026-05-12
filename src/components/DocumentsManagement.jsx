import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { FaFilePdf, FaShare, FaDownload, FaTrash, FaEdit, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

const DocumentsManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [alert, setAlert] = useState({ type: '', message: '' });
  const navigate = useNavigate();

  const documentsPerPage = 10;
  const API_URL = API_BASE_URL;

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (error) {
      showAlert('danger', 'Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: '', message: '' }), 3000);
  };

  const handleAction = async (action, doc) => {
    setActionLoading({ [doc._id]: true });
    try {
      const token = localStorage.getItem('token');
      
      switch (action) {
        case 'delete':
          await axios.delete(`${API_URL}/documents/${doc._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setDocuments(documents.filter(d => d._id !== doc._id));
          showAlert('success', 'Document supprimé');
          break;
          
        case 'share':
          handleShare(doc);
          break;
          
        case 'download':
          window.open(`${API_URL}/uploads/${doc.filePath.split('/').pop()}`, '_blank');
          break;
          
        case 'sign':
          navigate(`/sign/${doc._id}`);
          break;
          
        case 'view':
          navigate(`/document/${doc._id}`);
          break;
      }
    } catch (error) {
      showAlert('danger', 'Erreur lors de l\'action');
    } finally {
      setActionLoading({ [doc._id]: false });
    }
  };

  const handleShare = (doc) => {
    const shareUrl = `${window.location.origin}/sign/${doc._id}`;
    navigator.clipboard.writeText(shareUrl);
    showAlert('success', 'Lien copié dans le presse-papiers');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'signed': return <FaCheck className="text-green-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      case 'expired': return <FaTimes className="text-red-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDoc = currentPage * documentsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - documentsPerPage;
  const currentDocs = filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc);
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Alert */}
      {alert.message && (
        <div className={`alert alert-${alert.type} mb-4`} role="alert">
          {alert.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Mes Documents</h1>
        <button
          onClick={() => navigate('/upload')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Nouveau Document
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un document..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentDocs.map((doc) => (
          <div key={doc._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Document Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <FaFilePdf className="text-red-500 text-2xl mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800 truncate">{doc.name}</h3>
                  <p className="text-sm text-gray-500">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              {getStatusIcon(doc.status)}
            </div>

            {/* Document Info */}
            <div className="text-sm text-gray-600 mb-4">
              <p>Créé: {new Date(doc.createdAt).toLocaleDateString('fr-FR')}</p>
              <p>Hash: {doc.originalHash?.substring(0, 8)}...</p>
              {doc.signedAt && (
                <p>Signé: {new Date(doc.signedAt).toLocaleDateString('fr-FR')}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleAction('view', doc)}
                disabled={actionLoading[doc._id]}
                className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-sm disabled:opacity-50"
              >
                {actionLoading[doc._id] ? '...' : 'Voir'}
              </button>
              
              <button
                onClick={() => handleAction('sign', doc)}
                disabled={actionLoading[doc._id] || doc.status === 'signed'}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {actionLoading[doc._id] ? '...' : 'Signer'}
              </button>
              
              <button
                onClick={() => handleAction('share', doc)}
                disabled={actionLoading[doc._id]}
                className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                title="Partager"
              >
                <FaShare />
              </button>
              
              <button
                onClick={() => handleAction('download', doc)}
                disabled={actionLoading[doc._id]}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                title="Télécharger"
              >
                <FaDownload />
              </button>
              
              <button
                onClick={() => handleAction('delete', doc)}
                disabled={actionLoading[doc._id]}
                className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                title="Supprimer"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {currentDocs.length === 0 && (
        <div className="text-center py-12">
          <FaFilePdf className="text-gray-300 text-6xl mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucun document trouvé</p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Upload votre premier document
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Précédent
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentsManagement;
