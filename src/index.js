import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Désactiver les avertissements React DevTools en production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
