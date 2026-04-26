const axios = require('axios');

const testConnection = async () => {
  try {
    console.log('🧪 Test de connexion au backend...');
    
    // Test 1: Vérifier si le serveur répond
    const healthCheck = await axios.get('http://localhost:5000/api/auth/test');
    console.log('✅ Serveur répond:', healthCheck.data);
    
    // Test 2: Tenter la connexion admin
    console.log('🔐 Test de connexion admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'hisseinmhtdrya@gmail.com',
      password: 'admin123'
    });
    
    console.log('✅ Connexion réussie:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
};

testConnection();
