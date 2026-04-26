import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/totp/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsSetup(res.data.enabled);
    } catch (error) {
      console.error('Erreur vérification 2FA:', error);
    }
  };

  const setupTwoFactor = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/totp/enable', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSecret(res.data.secret);
      setQrCode(res.data.qrCode);
      setIsSetup(true);
      toast.success('2FA activée avec succès !');
    } catch (error) {
      toast.error('Erreur activation 2FA');
    }
    setIsLoading(false);
  };

  const verifyTwoFactor = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/totp/verify', {
        token: verificationToken
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('2FA vérifiée avec succès !');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Token 2FA invalide');
    }
    setIsLoading(false);
  };

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
            <h1 className="logo-text">Configuration 2FA</h1>
          </div>
          <p className="login-subtitle">
            Sécurisez votre compte avec l'authentification à deux facteurs
          </p>
        </div>

        {!isSetup ? (
          <form onSubmit={setupTwoFactor} className="login-form">
            <div className="two-factor-setup">
              <div className="setup-info">
                <h3>1. Scannez ce QR code</h3>
                <div className="qr-code-container">
                  {qrCode && <img src={qrCode} alt="QR Code 2FA" />}
                </div>
              </div>
              
              <button 
                type="button" 
                onClick={setupTwoFactor} 
                disabled={isLoading}
                className="modern-button"
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Générer le QR Code
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={verifyTwoFactor} className="login-form">
            <div className="two-factor-verify">
              <div className="verify-info">
                <h3>2. Entrez le code de votre application</h3>
                <p>Ouvrez Google Authenticator ou une autre application TOTP</p>
              </div>
              
              <div className="input-group">
                <div className="input-icon"> </div>
                <input
                  type="text"
                  placeholder="Code à 6 chiffres"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  maxLength={6}
                  required
                  className="modern-input"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                className="modern-button"
              >
                {isLoading ? (
                  <span className="loading-spinner"></span>
                ) : (
                  <>
                    Vérifier le code
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
        
        <div className="login-footer">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="skip-link"
          >
            Passer pour l'instant
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
