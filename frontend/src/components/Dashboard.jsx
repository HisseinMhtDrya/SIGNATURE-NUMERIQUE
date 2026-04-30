import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaShare, FaTrash, FaEdit, FaCopy, FaCalendar, FaClock, FaCheck, FaTimes, FaUsers } from 'react-icons/fa';
import CreateWorkflow from './CreateWorkflow';

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
        const res = await axios.post('http://localhost:5000/api/documents', formData, {
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
      const res = await axios.get('http://localhost:5000/api/documents', {
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
      const res = await axios.post(`http://localhost:5000/api/signatures/${docId}/sign`, {}, {
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
      const res = await axios.get(`http://localhost:5000/api/documents/${doc._id}/share`, {
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
      await axios.delete(`http://localhost:5000/api/documents/${docId}`, {
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
      await axios.put(`http://localhost:5000/api/documents/${docId}`, 
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
      const res = await axios.post(`http://localhost:5000/api/signatures/${docId}/verify/${sigId}`, {}, {
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
      const res = await axios.get(`http://localhost:5000/api/signatures/${docId}/history`, {
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
  const handleWorkflowCreated = (data) => {
    toast.success(`Workflow créé avec ${data.totalSteps} signataires !`);
    setShowWorkflowModal(false);
    setSelectedWorkflowDoc(null);
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
      </div>
      
      {/* Upload moderne */}
      <div className="upload-section">
        <h2 className="section-title">
          <span className="title-icon">📤</span>
          Ajouter un document
        </h2>
        <div className="upload-zone" {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="upload-content">
            <div className="upload-icon">�</div>
            <h3>Glissez-déposez votre document ici</h3>
            <p>ou cliquez pour parcourir vos fichiers</p>
            <div className="upload-formats">
              <span>Formats supportés:</span>
              <div className="format-badges">
                <span className="format-badge">PDF</span>
                <span className="format-badge">DOC</span>
                <span className="format-badge">DOCX</span>
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
            <div key={doc._id} className="document-card">
              <div className="document-header">
                <div className="document-icon">📄</div>
                <div className="document-info">
                  <h3>{doc.name}</h3>
                  <p className="document-meta">
                    {(doc.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <div className="document-hash">
                <span className="hash-label">Hash:</span>
                <code className="hash-value">{doc.originalHash.substring(0, 16)}...</code>
              </div>
              <div className="document-actions">
                <button 
                  onClick={() => fetchSignatures(doc._id)} 
                  className="action-btn secondary"
                >
                  <span className="btn-icon">📜</span>
                  Historique
                </button>
                <button 
                  onClick={() => signDocument(doc._id)} 
                  className="action-btn primary"
                  disabled={actionLoading[doc._id]}
                >
                  <span className="btn-icon">✍️</span>
                  {actionLoading[doc._id] ? '...' : 'Signer'}
                </button>
                <button 
                  onClick={() => openWorkflowModal(doc)} 
                  className="action-btn workflow"
                  disabled={actionLoading[doc._id]}
                >
                  <span className="btn-icon">👥</span>
                  {actionLoading[doc._id] ? '...' : 'Workflow'}
                </button>
                <button 
                  onClick={() => shareDocument(doc)} 
                  className="action-btn share"
                  disabled={actionLoading[doc._id]}
                >
                  <span className="btn-icon">🔗</span>
                  {actionLoading[doc._id] ? '...' : 'Partager'}
                </button>
                <a 
                  href={`http://localhost:5000${doc.filePath}`} 
                  download 
                  className="action-btn success"
                >
                  <span className="btn-icon">📥</span>
                  Télécharger
                </a>
                <button 
                  onClick={() => deleteDocument(doc._id)} 
                  className="action-btn danger"
                  disabled={actionLoading[doc._id]}
                >
                  <span className="btn-icon">🗑️</span>
                  {actionLoading[doc._id] ? '...' : 'Supprimer'}
                </button>
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
          onWorkflowCreated={handleWorkflowCreated}
          onClose={() => {
            setShowWorkflowModal(false);
            setSelectedWorkflowDoc(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
