const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  resource: { type: String, required: true }, // documents, users, admin
  action: { type: String, required: true }, // create, read, update, delete
  category: { type: String, enum: ['basic', 'advanced', 'admin'], default: 'basic' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Permission', permissionSchema);
