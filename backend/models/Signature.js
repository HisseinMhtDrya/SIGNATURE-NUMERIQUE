const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  signatureValue: { type: String, required: true }, // Signature RSA
  documentHashAtSigning: { type: String, required: true },
  signedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
});

module.exports = mongoose.model('Signature', signatureSchema);
