import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ThankYou.css';

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <div className="success-icon">✅</div>
        <h1>Merci !</h1>
        <p className="message">
          Votre action a été enregistrée avec succès.
        </p>
        <p className="sub-message">
          Vous pouvez maintenant fermer cette page.
        </p>
        <button 
          onClick={() => window.close()}
          className="btn btn-primary"
        >
          Fermer cette page
        </button>
      </div>
    </div>
  );
};

export default ThankYou;
