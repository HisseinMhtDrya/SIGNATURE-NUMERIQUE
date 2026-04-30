import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

const OtpAuth = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer les infos utilisateur depuis l'état de navigation
  const { email, password } = location.state || {};

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: email,
        password: password,
        otp: otp
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Connexion réussie !');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/request-otp', {
        email: email,
        password: password
      });
      
      toast.success('OTP renvoyé à votre email !');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    }
    setResendLoading(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  // Rediriger si pas d'email/password
  if (!email || !password) {
    navigate('/');
    return null;
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="login-card">
        <div className="login-header">
          <div className="logo-container">
            <div className="logo-icon"> </div>
            <h1 className="logo-text">Authentification OTP</h1>
          </div>
          <p className="login-subtitle">
            Entrez le code envoyé à votre email
          </p>
        </div>

        <div className="otp-info">
          <p>Un code OTP a été envoyé à : <strong>{email}</strong></p>
          <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
            Le code expire dans 10 minutes
          </p>
        </div>

        <form onSubmit={handleOtpSubmit} className="login-form">
          <div className="input-group">
            <div className="input-icon"> </div>
            <input
              type="text"
              placeholder="Code OTP à 6 chiffres"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              className="modern-input"
              maxLength={6}
              pattern="[0-9]{6}"
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px' }}
            />
          </div>
          
          <button type="submit" disabled={loading} className="modern-button">
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                Se connecter
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>
        
        <div className="otp-actions">
          <button 
            type="button" 
            onClick={handleResendOtp} 
            disabled={resendLoading}
            className="resend-otp-btn"
          >
            {resendLoading ? 'Envoi...' : 'Renvoyer l\'OTP'}
          </button>
          <button 
            type="button" 
            onClick={handleBack}
            className="back-btn"
          >
            Retour
          </button>
        </div>

        <div className="login-footer">
          <p style={{ fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
            Pas reçu le code ? Vérifiez vos spams ou demandez un nouvel OTP
          </p>
        </div>
      </div>
    </div>
  );
};

export default OtpAuth;
