import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { FaFilePdf, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUser, FaCalendar, FaEnvelope, FaEye, FaSearch } from 'react-icons/fa';
import './WorkflowHistory.css';

const WorkflowHistory = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchCreatedWorkflows();
  }, []);

  const fetchCreatedWorkflows = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('📋 Début récupération workflows créés...');
      console.log('🔑 Token présent:', !!token);
      
      if (!token) {
        console.log('❌ Aucun token trouvé');
        setError('Veuillez vous reconnecter');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/workflow/created`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Réponse API:', response.status);
      console.log('📊 Données reçues:', response.data);
      
      setWorkflows(response.data);
      console.log('✅ Workflows chargés:', response.data.length);
      
      if (response.data.length === 0) {
        console.log('ℹ️ Aucun workflow trouvé pour cet utilisateur');
      } else {
        console.log(`ℹ️ ${response.data.length} workflows trouvés`);
      }
    } catch (error) {
      console.error('❌ Erreur récupération workflows:', error);
      console.error('❌ Détails erreur:', error.response?.data || error.message);
      setError('Erreur lors du chargement des workflows');
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.documentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.steps.some(step => step.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <FaCheckCircle className="text-green-500" />;
      case 'cancelled': return <FaTimesCircle className="text-red-500" />;
      case 'in_progress': return <FaHourglassHalf className="text-yellow-500" />;
      default: return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'signed': return <FaCheckCircle className="text-green-500" />;
      case 'rejected': return <FaTimesCircle className="text-red-500" />;
      default: return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return '✅ Terminé';
      case 'cancelled': return '❌ Annulé';
      case 'in_progress': return '⏳ En cours';
      default: return '📋 En attente';
    }
  };

  const getStepStatusText = (status) => {
    switch (status) {
      case 'signed': return '✅ Signé';
      case 'rejected': return '❌ Refusé';
      default: return '⏳ En attente';
    }
  };

  const showWorkflowDetails = (workflow) => {
    setSelectedWorkflow(workflow);
    setShowDetailsModal(true);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Chargement de l'historique...</span>
      </div>
    );
  }

  return (
    <div className="workflow-history">
      <div className="workflow-history__header">
        <div className="workflow-history__title">
          <FaFilePdf className="workflow-history__icon" />
          <h1>Historique des Workflows de Signature</h1>
        </div>
        
        <div className="workflow-history__search">
          <FaSearch className="workflow-history__search-icon" />
          <input
            type="text"
            placeholder="Rechercher un document ou un signataire..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="workflow-history__search-input"
          />
        </div>
      </div>

      <div className="workflow-history__stats">
        <div className="workflow-history__stat">
          <span className="workflow-history__stat-number">{workflows.length}</span>
          <span className="workflow-history__stat-label">Total Workflows</span>
        </div>
        <div className="workflow-history__stat">
          <span className="workflow-history__stat-number">
            {workflows.filter(w => w.status === 'completed').length}
          </span>
          <span className="workflow-history__stat-label">Terminés</span>
        </div>
        <div className="workflow-history__stat">
          <span className="workflow-history__stat-number">
            {workflows.filter(w => w.status === 'in_progress').length}
          </span>
          <span className="workflow-history__stat-label">En cours</span>
        </div>
      </div>

      <div className="workflow-history__list">
        {filteredWorkflows.length === 0 ? (
          <div className="workflow-history__empty">
            <FaFilePdf className="workflow-history__empty-icon" />
            <h3>Aucun workflow trouvé</h3>
            <p>
              {searchTerm 
                ? 'Aucun workflow ne correspond à votre recherche.' 
                : 'Vous n\'avez créé aucun workflow de signature.'}
            </p>
          </div>
        ) : (
          filteredWorkflows.map((workflow) => (
            <div key={workflow._id} className="workflow-history__item">
              <div className="workflow-history__item-header">
                <div className="workflow-history__item-info">
                  <div className="workflow-history__document-name">
                    <FaFilePdf className="workflow-history__document-icon" />
                    <h3>{workflow.documentId?.name || 'Document inconnu'}</h3>
                  </div>
                  
                  <div className="workflow-history__item-meta">
                    <span className={`workflow-history__status ${getStatusBadge(workflow.status)}`}>
                      {getStatusIcon(workflow.status)}
                      {getStatusText(workflow.status)}
                    </span>
                    
                    <div className="workflow-history__dates">
                      <div className="workflow-history__date">
                        <FaCalendar />
                        <span>Créé: {formatDate(workflow.createdAt)}</span>
                      </div>
                      {workflow.completedAt && (
                        <div className="workflow-history__date">
                          <FaCheckCircle />
                          <span>Terminé: {formatDate(workflow.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => showWorkflowDetails(workflow)}
                  className="workflow-history__view-btn"
                >
                  <FaEye />
                  Voir les détails
                </button>
              </div>
              
              <div className="workflow-history__progress">
                <div className="workflow-history__progress-info">
                  <span>Progression: {workflow.steps.filter(s => s.status === 'signed').length} / {workflow.steps.length} signatures</span>
                  <span>Étape actuelle: {workflow.currentStep + 1} / {workflow.steps.length}</span>
                </div>
                <div className="workflow-history__progress-bar">
                  <div 
                    className="workflow-history__progress-fill"
                    style={{ 
                      width: `${(workflow.steps.filter(s => s.status === 'signed').length / workflow.steps.length) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="workflow-history__signers">
                <h4>Signataires:</h4>
                <div className="workflow-history__signers-list">
                  {workflow.steps.map((step, index) => (
                    <div key={index} className="workflow-history__signer">
                      <div className="workflow-history__signer-info">
                        <FaEnvelope className="workflow-history__signer-icon" />
                        <span className="workflow-history__signer-email">{step.email}</span>
                        {step.userId && (
                          <span className="workflow-history__signer-name">
                            ({step.userId.name})
                          </span>
                        )}
                      </div>
                      <div className="workflow-history__signer-status">
                        {getStepStatusIcon(step.status)}
                        <span>{getStepStatusText(step.status)}</span>
                        {step.signedAt && (
                          <span className="workflow-history__signer-date">
                            {formatDate(step.signedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Détails */}
      {showDetailsModal && selectedWorkflow && (
        <div className="workflow-details__modal">
          <div className="workflow-details__modal-content">
            <div className="workflow-details__modal-header">
              <h2>Détails du Workflow</h2>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="workflow-details__modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="workflow-details__modal-body">
              <div className="workflow-details__section">
                <h3>Document</h3>
                <p><strong>Nom:</strong> {selectedWorkflow.documentId?.name || 'N/A'}</p>
                <p><strong>Statut:</strong> {getStatusText(selectedWorkflow.status)}</p>
                <p><strong>Créé le:</strong> {formatDate(selectedWorkflow.createdAt)}</p>
                {selectedWorkflow.completedAt && (
                  <p><strong>Terminé le:</strong> {formatDate(selectedWorkflow.completedAt)}</p>
                )}
              </div>
              
              <div className="workflow-details__section">
                <h3>Historique des Signatures</h3>
                <div className="workflow-details__timeline">
                  {selectedWorkflow.steps.map((step, index) => (
                    <div key={index} className="workflow-details__timeline-item">
                      <div className="workflow-details__timeline-marker">
                        {getStepStatusIcon(step.status)}
                      </div>
                      <div className="workflow-details__timeline-content">
                        <div className="workflow-details__timeline-header">
                          <span className="workflow-details__timeline-email">{step.email}</span>
                          <span className="workflow-details__timeline-status">
                            {getStepStatusText(step.status)}
                          </span>
                        </div>
                        
                        {step.status === 'signed' && (
                          <div className="workflow-details__signature-info">
                            <p><strong>Signé le:</strong> {formatDate(step.signedAt)}</p>
                            {step.signatureData && (
                              <div className="workflow-details__signature-preview">
                                <strong>Signature:</strong>
                                <img 
                                  src={step.signatureData} 
                                  alt="Signature" 
                                  className="workflow-details__signature-image"
                                />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {step.status === 'rejected' && (
                          <div className="workflow-details__rejection-info">
                            <p><strong>Refusé le:</strong> {formatDate(step.signedAt)}</p>
                            <p><strong>Raison:</strong> {step.rejectionReason || 'Aucune raison spécifiée'}</p>
                          </div>
                        )}
                        
                        {step.status === 'pending' && (
                          <p className="workflow-details__pending-info">
                            En attente de signature...
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowHistory;
