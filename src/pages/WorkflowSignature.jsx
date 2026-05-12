import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import './WorkflowSignature.css';

const WorkflowSignature = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState('');
  const [canSign, setCanSign] = useState(false);
  const [showOTP, setShowOTP] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sigCanvas = useRef();

  useEffect(() => {
    fetchWorkflow();
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/workflow/${workflowId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error('Workflow non trouvé');
      }
      
      const data = await res.json();
      setWorkflow(data);
      setStep(data.currentStep);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Veuillez entrer un code OTP à 6 chiffres');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/workflow/verify-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflowId, otp })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'OTP invalide');
      }
      
      if (data.success) {
        setCanSign(true);
        setShowOTP(false);
        setError('');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const signDocument = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      setError('Veuillez signer avant de valider');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const signatureData = sigCanvas.current.toDataURL();
      
      const res = await fetch(`${API_BASE_URL}/workflow/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflowId, signatureData })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la signature');
      }
      
      if (data.success) {
        alert(data.message || 'Signature enregistrée avec succès !');
        if (data.workflow.status === 'completed') {
          navigate('/dashboard');
        } else {
          fetchWorkflow();
          setCanSign(false);
          setShowOTP(true);
          setOtp('');
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectSignature = async () => {
    const reason = prompt('Veuillez indiquer la raison du refus :');
    if (!reason) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/workflow/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflowId, rejectionReason: reason })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du refus');
      }
      
      if (data.success) {
        alert('Signature refusée. Le workflow a été annulé.');
        navigate('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOTP = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/workflow/resend-otp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ workflowId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du renvoi');
      }
      
      if (data.success) {
        alert(`Nouveau code OTP envoyé à ${data.email}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  if (loading) {
    return (
      <div className="workflow-container">
        <div className="loading">Chargement du workflow...</div>
      </div>
    );
  }

  if (error && !workflow) {
    return (
      <div className="workflow-container">
        <div className="error">
          <h2>❌ Erreur</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')}>Retour au tableau de bord</button>
        </div>
      </div>
    );
  }

  return (
    <div className="workflow-container">
      <div className="workflow-header">
        <h1>📋 Workflow de Signature</h1>
        <div className="document-info">
          <strong>Document:</strong> {workflow?.documentId?.name}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="progress-section">
        <h3>Progression du workflow</h3>
        <div className="progress-bar">
          {workflow?.steps.map((s, i) => (
            <div 
              key={i} 
              className={`step ${i < step ? 'completed' : i === step ? 'current' : 'pending'}`}
              title={`${s.email} - ${s.status}`}
            >
              <span className="step-number">{i + 1}</span>
              <span className="step-email">{s.email.split('@')[0]}</span>
              <span className="step-status">{s.status}</span>
            </div>
          ))}
        </div>
        <div className="workflow-status">
          <strong>Statut:</strong> 
          <span className={`status-badge ${workflow?.status}`}>
            {workflow?.status === 'completed' ? '✅ Terminé' : 
             workflow?.status === 'in_progress' ? '🔄 En cours' : 
             workflow?.status === 'cancelled' ? '❌ Annulé' : '⏳ En attente'}
          </span>
        </div>
      </div>

      {/* Étape actuelle */}
      {workflow?.status !== 'completed' && workflow?.status !== 'cancelled' && (
        <div className="current-step">
          <h3>👤 Étape {step + 1} : {workflow?.steps[step]?.email}</h3>
          
          {error && <div className="error-message">{error}</div>}
          
          {showOTP ? (
            <div className="otp-section">
              <h4>🔐 Vérification OTP</h4>
              <p>Entrez le code à 6 chiffres reçu par email :</p>
              <div className="otp-input-group">
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className="otp-input"
                />
                <button 
                  onClick={verifyOTP} 
                  disabled={isSubmitting || otp.length !== 6}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Vérification...' : 'Vérifier'}
                </button>
              </div>
              <button 
                onClick={resendOTP} 
                disabled={isSubmitting}
                className="btn btn-secondary"
              >
                Renvoyer le code
              </button>
            </div>
          ) : (
            <div className="signature-section">
              <h4>✍️ Signez ici</h4>
              <div className="signature-canvas-container">
                <SignatureCanvas 
                  ref={sigCanvas}
                  canvasProps={{ 
                    className: 'signature-canvas',
                    width: 600,
                    height: 200
                  }}
                />
              </div>
              <div className="signature-actions">
                <button 
                  onClick={clearSignature} 
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Effacer
                </button>
                <button 
                  onClick={signDocument} 
                  className="btn btn-success"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signature en cours...' : '✅ Signer & Continuer'}
                </button>
                <button 
                  onClick={rejectSignature} 
                  className="btn btn-danger"
                  disabled={isSubmitting}
                >
                  ❌ Refuser
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {workflow?.status === 'completed' && (
        <div className="completed-section">
          <h2>🎉 Workflow Terminé !</h2>
          <p>Toutes les signatures ont été collectées avec succès.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-primary"
          >
            Retour au tableau de bord
          </button>
        </div>
      )}

      {workflow?.status === 'cancelled' && (
        <div className="cancelled-section">
          <h2>❌ Workflow Annulé</h2>
          <p>Le workflow a été annulé suite à un refus de signature.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-primary"
          >
            Retour au tableau de bord
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowSignature;
