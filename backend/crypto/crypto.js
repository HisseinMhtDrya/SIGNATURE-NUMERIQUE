const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const CryptoJS = require('crypto-js');

// Génération de clés RSA
function generateKeyPair() {
  const key = new NodeRSA({ b: 2048 });
  return {
    publicKey: key.exportKey('public'),
    privateKey: key.exportKey('private')
  };
}

// Hash SHA-256 d'un fichier
async function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = require('fs').createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// Hash SHA-256 d'un buffer
function calculateBufferHash(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Signature RSA
function signData(data, privateKey) {
  const key = new NodeRSA(privateKey);
  key.setOptions({ signingScheme: 'sha256' });
  return key.sign(data, 'base64');
}

// Vérification RSA
function verifySignature(data, signature, publicKey) {
  try {
    const key = new NodeRSA(publicKey);
    key.setOptions({ signingScheme: 'sha256' });
    return key.verify(data, signature, 'utf8', 'base64');
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateKeyPair,
  calculateFileHash,
  calculateBufferHash,
  signData,
  verifySignature
};
