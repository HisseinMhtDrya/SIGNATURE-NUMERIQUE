// Utilitaire pour sécuriser l'accès au localStorage
export const safeGetUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return {};
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Erreur parsing user from localStorage:', error);
    return {};
  }
};

export const safeGetToken = () => {
  return localStorage.getItem('token');
};
