import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

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

      {/* Liste documents moderne */}
      <div className="documents-section">
        <h2 className="section-title">
          <span className="title-icon">📋</span>
          Mes documents
        </h2>
        <div className="documents-grid">
          {documents.map(doc => (
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
                >
                  <span className="btn-icon">✍️</span>
                  Signer
                </button>
                <a 
                  href={`http://localhost:5000${doc.filePath}`} 
                  download 
                  className="action-btn success"
                >
                  <span className="btn-icon">📥</span>
                  Télécharger
                </a>
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
    </div>
  );
};

export default Dashboard;
