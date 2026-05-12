import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { toast } from 'react-toastify';

const AdminDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  // PAGE ADMIN - UNIQUEMENT CONSULTATION DES DOCUMENTS UTILISATEURS

  useEffect(() => {
    fetchDocuments();
    fetchSignatures();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data);
    } catch (error) {
      toast.error('Erreur documents');
    }
  };

  const fetchSignatures = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/signatures`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSignatures(res.data);
    } catch (error) {
      toast.error('Erreur signatures');
    }
    setLoading(false);
  };

  const getDocumentSignatures = (documentId) => {
    return signatures.filter(sig => sig.document && sig.document._id === documentId);
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.owner && doc.owner.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-header">
          <div className="admin-title">
            <h1>
              <span className="crown-icon"> </span>
              Gestion des Documents
            </h1>
            <p className="admin-subtitle">Consultez tous les documents signés par les utilisateurs</p>
          </div>
        </div>
        <div className="loading-section">
          <div className="documents-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="document-card skeleton">
                <div className="document-header">
                  <div className="document-icon skeleton-icon"></div>
                  <div className="document-info">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-meta"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-title">
          <h1>
            <span className="crown-icon"> </span>
            Gestion des Documents
          </h1>
          <p className="admin-subtitle">Consultez tous les documents signés par les utilisateurs</p>
        </div>
      </div>

      {/* Section de recherche - PAS D'UPLOAD POUR ADMIN */}
      <div className="documents-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon"> </span>
            Documents Signés
          </h2>
          <div className="search-container">
            <div className="search-input-group">
              <div className="search-icon"> </div>
              <input
                type="text"
                placeholder="Rechercher par nom de document ou utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-search"
              />
            </div>
            <button onClick={() => setSearchTerm('')} className="reset-btn">
              <span className="btn-icon"> </span>
              Tout afficher
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-icon"> </div>
            <div className="stat-info">
              <h3>{documents.length}</h3>
              <p>Total Documents</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"> </div>
            <div className="stat-info">
              <h3>{signatures.length}</h3>
              <p>Total Signatures</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"> </div>
            <div className="stat-info">
              <h3>{new Set(signatures.map(sig => sig.user)).size}</h3>
              <p>Utilisateurs actifs</p>
            </div>
          </div>
        </div>

        {/* Grid des documents */}
        <div className="documents-grid">
          {filteredDocuments.map(doc => {
            const docSignatures = getDocumentSignatures(doc._id);
            return (
              <div key={doc._id} className="document-card">
                <div className="document-header">
                  <div className="document-icon"> </div>
                  <div className="document-info">
                    <h3>{doc.name}</h3>
                    <p className="document-meta">
                      {doc.owner ? `Par ${doc.owner.name}` : 'Utilisateur inconnu'}
                    </p>
                  </div>
                </div>
                
                <div className="document-hash">
                  <span className="hash-label">HASH:</span>
                  <span className="hash-value">{doc.originalHash ? doc.originalHash.substring(0, 12) + '...' : 'N/A'}</span>
                </div>

                <div className="signatures-preview">
                  <h4>Signatures ({docSignatures.length})</h4>
                  <div className="signatures-list">
                    {docSignatures.slice(0, 3).map(sig => (
                      <div key={sig._id} className="signature-item">
                        <div className="signature-avatar">
                          {sig.user ? sig.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="signature-info">
                          <span>{sig.user ? sig.user.name : 'Utilisateur'}</span>
                          <span className="signature-date">
                            {new Date(sig.signedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {docSignatures.length > 3 && (
                      <div className="more-signatures">
                        +{docSignatures.length - 3} autres signatures
                      </div>
                    )}
                  </div>
                </div>

                <div className="document-info-only">
                  <p className="document-note">
                    Ce document a été signé par {getDocumentSignatures(doc._id).length} utilisateur(s)
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"> </div>
            <h3>Aucun document trouvé</h3>
            <p>Aucun document ne correspond à votre recherche</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentsPage;
