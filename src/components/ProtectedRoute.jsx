import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        return;
      }

      try {
        // Vérifier si le token est valide en faisant une requête protégée
        const response = await axios.get(`${API_BASE_URL}/documents`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Si la requête réussit, le token est valide
        setIsAuthenticated(true);
      } catch (error) {
        // Token invalide ou expiré
        console.error('Token validation failed:', error.response?.status);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  if (isValidating) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Vérification de l'authentification...
      </div>
    );
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
