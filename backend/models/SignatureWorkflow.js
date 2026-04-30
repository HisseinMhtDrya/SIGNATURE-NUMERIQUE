const mongoose = require('mongoose');

const signatureStepSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optionnel lors de la création
  email: { type: String, required: true },
  order: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'signed', 'rejected'], 
    default: 'pending' 
  },
  otpCode: String,
  otpExpires: Date,
  signedAt: Date,
  signatureData: String, // Base64 de la signature
  rejectionReason: String
});

const signatureWorkflowSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  steps: [signatureStepSchema],
  currentStep: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Index pour optimiser les requêtes
signatureWorkflowSchema.index({ documentId: 1 });
signatureWorkflowSchema.index({ 'steps.email': 1 });
signatureWorkflowSchema.index({ status: 1 });

module.exports = mongoose.model('SignatureWorkflow', signatureWorkflowSchema);
