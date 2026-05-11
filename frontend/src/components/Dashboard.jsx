import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaShare, FaTrash, FaEdit, FaCopy, FaCalendar, FaClock, FaCheck, FaTimes, FaUsers, FaFilePdf, FaEye, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaEnvelope, FaHistory, FaSignature, FaDownload, FaCloudUploadAlt, FaFolderOpen, FaFileAlt, FaFileWord, FaFileImage } from 'react-icons/fa';
import CreateWorkflow from './CreateWorkflow';
import './DashboardModern.css';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [shareUrls, setShareUrls] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [selectedWorkflowDoc, setSelectedWorkflowDoc] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const documentsPerPage = 6;

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchDocuments();
  }, [token, navigate]);

  // Upload fichier
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    onDrop: async (acceptedFiles) => {
      const formData = new FormData();
      formData.append('document', acceptedFiles[0]);
      
      try {
        const res = await axios.post(`${API_BASE_URL}/documents`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Document uploadé !');
        fetchDocuments();
      } catch (error) {
        toast.error('Erreur upload');
      }
    }
  });

  // Charger documents
  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (error) {
      toast.error('Erreur chargement documents');
    }
  };


  // Signer document
  const signDocument = async (docId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/signatures/${docId}/sign`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Document signé !');
      fetchSignatures(docId);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur signature');
    }
  };

  // Partager document
  const shareDocument = async (doc) => {
    setActionLoading({ [doc._id]: true });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/documents/${doc._id}/share`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const urls = res.data.map(signer => ({
        email: signer.email,
        url: signer.signUrl,
        signed: signer.signed
      }));
      
      setShareUrls(urls);
      setShowShareModal(true);
      toast.success('Liens de partage générés');
    } catch (error) {
      toast.error('Erreur génération liens');
    } finally {
      setActionLoading({ [doc._id]: false });
    }
  };

  // Copier lien
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Lien copié');
  };

  // Supprimer document
  const deleteDocument = async (docId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document?')) return;
    
    setActionLoading({ [docId]: true });
    try {
      await axios.delete(`${API_BASE_URL}/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(documents.filter(doc => doc._id !== docId));
      toast.success('Document supprimé');
    } catch (error) {
      toast.error('Erreur suppression');
    } finally {
      setActionLoading({ [docId]: false });
    }
  };

  // Renommer document
  const renameDocument = async (docId, newName) => {
    try {
      await axios.put(`${API_BASE_URL}/documents/${docId}`, 
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocuments(documents.map(doc => 
        doc._id === docId ? { ...doc, name: newName } : doc
      ));
      toast.success('Document renommé');
    } catch (error) {
      toast.error('Erreur renommage');
    }
  };

  // Filtrer documents
  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastDoc = currentPage * documentsPerPage;
  const indexOfFirstDoc = indexOfLastDoc - documentsPerPage;
  const currentDocs = filteredDocuments.slice(indexOfFirstDoc, indexOfLastDoc);
  const totalPages = Math.ceil(filteredDocuments.length / documentsPerPage);

  // Vérifier signature
  const verifySignature = async (docId, sigId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/signatures/${docId}/verify/${sigId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data.signature.valid && res.data.document.integrity) {
        toast.success(' Document et signature VALIDES');
      } else {
        toast.error(' Document ou signature invalide');
      }
      
      console.log('Vérification:', res.data);
    } catch (error) {
      toast.error('Erreur vérification');
    }
  };

  // Charger signatures
  const fetchSignatures = async (docId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/signatures/${docId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSignatures(res.data);
      setSelectedDoc(docId);
    } catch (error) {
      toast.error('Erreur historique');
    }
  };

  // Ouvrir le modal de workflow
  const openWorkflowModal = (doc) => {
    setSelectedWorkflowDoc(doc);
    setShowWorkflowModal(true);
  };

  // Callback après création du workflow


  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>
            <span className="welcome-text">Bienvenue</span>
            <span className="user-name">{user?.name}</span>
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
              <h3>{signatures.length}</h3>
              <p>Signatures</p>
            </div>
          </div>
        </div>
        
        <div className="workflow-link-section">
          <button 
            onClick={() => window.location.href = '/workflows'}
            className="workflow-link-btn"
          >
            <FaHistory />
            Voir l'historique des workflows
          </button>
        </div>
      </div>
      
      {/* Upload moderne */}
      <div className="upload-section-modern">
        <div className="upload-header">
          <h2 className="section-title">
            <FaCloudUploadAlt className="title-icon-modern" />
            Ajouter un document
          </h2>
          <p className="upload-subtitle">Importez vos documents pour les signer et les partager</p>
        </div>
        
        <div className="upload-zone-modern" {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="upload-content-modern">
            <div className="upload-icon-container">
              <div className="upload-icon-main">
                <FaCloudUploadAlt />
              </div>
              <div className="upload-icon-bg">
                <FaFolderOpen />
              </div>
            </div>
            
            <div className="upload-text">
              <h3 className="upload-title">Glissez-déposez votre document ici</h3>
              <p className="upload-description">ou cliquez pour parcourir vos fichiers</p>
            </div>
            
            <div className="upload-formats-modern">
              <div className="formats-header">
                <FaFileAlt className="formats-icon" />
                <span>Formats supportés:</span>
              </div>
              <div className="format-badges-modern">
                <div className="format-badge-modern pdf">
                  <FaFilePdf />
                  <span>PDF</span>
                </div>
                <div className="format-badge-modern doc">
                  <FaFileWord />
                  <span>DOC</span>
                </div>
                <div className="format-badge-modern docx">
                  <FaFileWord />
                  <span>DOCX</span>
                </div>
              </div>
            </div>
            
            <div className="upload-features">
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <span>Sécurisé</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <span>Rapide</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <span>Compatible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Liste documents moderne */}
      <div className="documents-section">
        <h2 className="section-title">
          <span className="title-icon">📋</span>
          Mes documents
        </h2>
        <div className="documents-grid">
          {currentDocs.map(doc => (
            <div key={doc._id} className="document-card-modern">
              {/* Header du document */}
              <div className="document-card-header">
                <div className="document-preview">
                  <div className="document-icon-modern">
                    <FaFilePdf />
                  </div>
                  <div className="document-badge">
                    PDF
                  </div>
                </div>
                <div className="document-info-modern">
                  <h3 className="document-title">{doc.name}</h3>
                  <div className="document-meta-modern">
                    <span className="document-size">
                      <FaFilePdf />
                      {(doc.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <span className="document-date">
                      <FaCalendar />
                      {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hash et sécurité */}
              <div className="document-security">
                <div className="security-info">
                  <div className="security-icon">
                    <FaCheck className="verified-icon" />
                  </div>
                  <div className="security-details">
                    <span className="security-label">Document sécurisé</span>
                    <code className="hash-value-modern">{doc.originalHash.substring(0, 12)}...</code>
                  </div>
                </div>
              </div>

              {/* Actions modernes */}
              <div className="document-actions-modern">
                <div className="actions-row">
                  <button 
                    onClick={() => fetchSignatures(doc._id)} 
                    className="action-btn-modern secondary"
                    title="Voir l'historique des signatures"
                  >
                    <FaHistory />
                    <span>Historique</span>
                  </button>
                  <button 
                    onClick={() => signDocument(doc._id)} 
                    className="action-btn-modern primary"
                    disabled={actionLoading[doc._id]}
                    title="Signer ce document"
                  >
                    <FaSignature />
                    <span>{actionLoading[doc._id] ? '...' : 'Signer'}</span>
                  </button>
                </div>
                
                <div className="actions-row">
                  <button 
                    onClick={() => openWorkflowModal(doc)} 
                    className="action-btn-modern workflow"
                    disabled={actionLoading[doc._id]}
                    title="Créer un workflow de signature"
                  >
                    <FaUsers />
                    <span>{actionLoading[doc._id] ? '...' : 'Workflow'}</span>
                  </button>
                  <button 
                    onClick={() => shareDocument(doc)} 
                    className="action-btn-modern share"
                    disabled={actionLoading[doc._id]}
                    title="Partager ce document"
                  >
                    <FaShare />
                    <span>{actionLoading[doc._id] ? '...' : 'Partager'}</span>
                  </button>
                </div>
                
                <div className="actions-row">
                  <button 
                    onClick={() => {
                      if (!doc.filePath) {
                        console.error('Erreur: filePath non défini pour le document:', doc);
                        toast.error('Erreur: chemin du document non disponible');
                        return;
                      }
                      const link = document.createElement('a');
                      link.href = `${API_BASE_URL.replace('/api', '')}/${doc.filePath}`;
                      link.download = doc.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="action-btn-modern download"
                    title="Télécharger le document"
                  >
                    <FaDownload />
                    <span>Télécharger</span>
                  </button>
                  <button 
                    onClick={() => deleteDocument(doc._id)} 
                    className="action-btn-modern danger"
                    disabled={actionLoading[doc._id]}
                    title="Supprimer ce document"
                  >
                    <FaTrash />
                    <span>{actionLoading[doc._id] ? '...' : 'Supprimer'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      
      {/* Historique signatures moderne */}
      {signatures.length > 0 && (
        <div className="signatures-section">
          <h2 className="section-title">
            <span className="title-icon">📋</span>
            Historique des signatures
          </h2>
          <div className="signatures-grid">
            {signatures.map(sig => (
              <div key={sig._id} className="signature-card">
                <div className="signature-header">
                  <div className="signature-avatar">
                    {sig.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="signature-info">
                    <h4>{sig.user.name}</h4>
                    <p className="signature-date">
                      {new Date(sig.signedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="signature-details">
                  <p className="signature-ip">
                    <span className="detail-label">IP:</span> {sig.ipAddress}
                  </p>
                </div>
                <button 
                  onClick={() => verifySignature(selectedDoc, sig._id)} 
                  className="verify-btn"
                >
                  <span className="btn-icon">🔍</span>
                  Vérifier
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de création de workflow */}
      {showWorkflowModal && (
        <CreateWorkflow
          documentId={selectedWorkflowDoc?._id}
          onWorkflowCreated={(data) => {
            toast.success(`Workflow créé avec ${data.totalSteps} signataires !`);
            setShowWorkflowModal(false);
            setSelectedWorkflowDoc(null);
          }}
          onClose={() => {
            setShowWorkflowModal(false);
            setSelectedWorkflowDoc(null);
          }}
        />
      )}

      {/* Modal de partage */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="modal-content share-modal">
            <div className="modal-header">
              <h2>📤 Partager le document</h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="share-links">
                {shareUrls.map((shareUrl, index) => (
                  <div key={index} className="share-item">
                    <div className="share-info">
                      <div className="share-email">
                        <strong>{shareUrl.email}</strong>
                        {shareUrl.signed && <span className="signed-badge">✅ Signé</span>}
                      </div>
                      <div className="share-url">
                        <input 
                          type="text" 
                          value={shareUrl.url} 
                          readOnly 
                          className="share-input"
                        />
                        <button 
                          onClick={() => copyToClipboard(shareUrl.url)}
                          className="copy-btn"
                        >
                          📋 Copier
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {shareUrls.length === 0 && (
                <div className="no-share-urls">
                  <p>Aucun lien de partage disponible. Créez d'abord une signature pour ce document.</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={() => setShowShareModal(false)}
                className="btn btn-secondary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

          </div>
  );
};

export default Dashboard;
