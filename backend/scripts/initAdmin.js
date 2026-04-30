const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/signature-numerique');
    console.log('✅ Connecté à MongoDB');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: 'hisseinmhtdrya@gmail.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      
      // Mettre à jour le rôle si nécessaire
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('🔄 Updated user role to admin');
      }
      
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('✅ Active:', existingAdmin.isActive);
    } else {
      // Créer le compte admin
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = new User({
        name: 'Admin Signature',
        email: 'hisseinmhtdrya@gmail.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log('👤 Admin user created successfully');
      console.log('📧 Email: hisseinmhtdrya@gmail.com');
      console.log('🔑 Password: admin123');
      console.log('🔑 Role: admin');
    }

    // Lister tous les utilisateurs
    const allUsers = await User.find({});
    console.log('\n📋 All users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} | Role: ${user.role} | Active: ${user.isActive}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createAdminUser();
