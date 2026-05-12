import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        setLoadingMessage('Création de votre compte en cours...');
        // Inscription - ne pas auto-connecter
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        toast.success('Compte créé ! Veuillez vous connecter.');
        // Réinitialiser le formulaire et passer en mode connexion
        setFormData({
          name: '',
          email: formData.email, // Garde l'email pour faciliter la connexion
          password: ''
        });
        setIsRegister(false);
      } else {
        setLoadingMessage('Connexion en cours...');
        // Essayer la connexion directe d'abord
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: formData.email,
            password: formData.password
          });
          
          // Si la connexion réussit, l'utilisateur est soit admin, soit déjà vérifié OTP
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          toast.success('Connexion réussie !');
          navigate('/dashboard');
          
        } catch (loginError) {
          // Si la connexion échoue avec "OTP requis", demander l'OTP
          if (loginError.response?.data?.error?.includes('OTP requis')) {
            const response = await axios.post(`${API_BASE_URL}/auth/request-otp`, {
              email: formData.email,
              password: formData.password
            });
            
            toast.success('OTP envoyé à votre email !');
            // Rediriger vers la page OTP avec les identifiants
            navigate('/otp-auth', { 
              state: { 
                email: formData.email, 
                password: formData.password 
              } 
            });
          } else {
            // Autre erreur de connexion
            throw loginError;
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Erreur de connexion';
      
      // Messages d'erreur spécifiques
      if (errorMessage.includes('Identifiants incorrects')) {
        toast.error('Email ou mot de passe incorrect');
      } else if (errorMessage.includes('Email déjà utilisé')) {
        toast.error('Cet email est déjà utilisé');
      } else if (errorMessage.includes('Email et mot de passe requis')) {
        toast.error('Veuillez remplir tous les champs');
      } else {
        toast.error(errorMessage);
      }
    }
    setLoading(false);
    setLoadingMessage('');
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
            <h1 className="logo-text">Signature Numérique</h1>
          </div>
          <p className="login-subtitle">
            {isRegister ? 'Créez votre compte' : 'Connectez-vous à votre espace'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="input-group">
              <div className="input-icon"> </div>
              <input
                type="text"
                placeholder="Nom complet"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="modern-input"
              />
            </div>
          )}
          
          <div className="input-group">
            <div className="input-icon"> </div>
            <input
              type="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              className="modern-input"
            />
          </div>
          
          <div className="input-group">
            <div className="input-icon"> </div>
            <input
              type="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              className="modern-input"
            />
          </div>
          
          <button type="submit" disabled={loading} className="modern-button">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                <span className="loading-text">{loadingMessage}</span>
              </>
            ) : (
              <>
                {isRegister ? 'Créer mon compte' : 'Se connecter'}
                <span className="button-arrow">→</span>
              </>
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p onClick={() => setIsRegister(!isRegister)} className="toggle-link">
            {isRegister ? 'Déjà un compte ?' : 'Pas de compte ?'}
            <span className="link-highlight">
              {isRegister ? ' Se connecter' : ' Créer un compte'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
