import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import './CreateWorkflow.css';

const CreateWorkflow = ({ documentId, onWorkflowCreated, onClose }) => {
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emails.trim()) {
      setError('Veuillez entrer au moins une adresse email');
      return;
    }

    // Valider les emails
    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    for (const email of emailList) {
      if (!emailRegex.test(email)) {
        setError(`Email invalide: ${email}`);
        return;
      }
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Veuillez vous reconnecter');
        return;
      }
      
      // Envoyer directement la requête sans vérification préalable
      // Le middleware d'authentification vérifiera le token
      const res = await fetch(`${API_BASE_URL}/workflow/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId,
          emails: emailList
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Token expiré ou invalide
          localStorage.removeItem('token');
          setError('Session expirée. Veuillez vous reconnecter.');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.error || 'Erreur lors de la création du workflow');
      }

      if (data.success) {
        alert(`Workflow créé avec succès ! ${data.totalSteps} signataires invités.`);
        if (onWorkflowCreated) {
          onWorkflowCreated(data);
        }
        if (onClose) {
          onClose();
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-workflow-overlay">
      <div className="create-workflow-modal">
        <div className="modal-header">
          <h2>🚀 Créer un Workflow de Signature</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="workflow-form">
          <div className="form-group">
            <label htmlFor="emails">
              📧 Emails des signataires (séparés par des virgules) :
            </label>
            <textarea
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="email1@example.com, email2@example.com, email3@example.com"
              rows={4}
              required
            />
            <small>
              Les signataires signeront dans l'ordre indiqué. Le premier recevra immédiatement un email avec un code OTP.
            </small>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Création en cours...' : '🚀 Créer le Workflow'}
            </button>
          </div>
        </form>

        <div className="workflow-info">
          <h3>ℹ️ Informations importantes</h3>
          <ul>
            <li>Chaque signataire recevra un email avec un code OTP à 6 chiffres</li>
            <li>Le code OTP est valide pendant 5 minutes</li>
            <li>Les signatures se font de manière séquentielle (l'une après l'autre)</li>
            <li>Un signataire peut refuser de signer, ce qui annulera tout le workflow</li>
            <li>Toutes les actions sont enregistrées dans un journal d'audit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkflow;
