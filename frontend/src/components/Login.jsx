import React, { useState } from 'react';
import axios from 'axios';
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
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success(isRegister ? 'Inscription réussie !' : 'Connexion réussie !');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur');
    }
    setLoading(false);
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
              <span className="loading-spinner"></span>
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
