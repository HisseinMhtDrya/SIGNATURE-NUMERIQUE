const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  filePath: { type: String, required: true },
  originalHash: { type: String, required: true }, // SHA-256
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  size: { type: Number },
  mimeType: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
