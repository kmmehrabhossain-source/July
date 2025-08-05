const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/july-archive', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@julyarchive.com' });
    
    if (!adminExists) {
      // Create admin user
      const adminUser = await User.create({
        username: 'admin',
        email: 'admin@julyarchive.com',
        password: 'admin123',
        role: 'admin'
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@julyarchive.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create a regular user for testing
    const testUserExists = await User.findOne({ email: 'user@julyarchive.com' });
    
    if (!testUserExists) {
      const testUser = await User.create({
        username: 'testuser',
        email: 'user@julyarchive.com',
        password: 'user123',
        role: 'user'
      });
      
      console.log('✅ Test user created successfully!');
      console.log('📧 Email: user@julyarchive.com');
      console.log('🔑 Password: user123');
    } else {
      console.log('ℹ️ Test user already exists');
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Available users:');
    console.log('👑 Admin: admin@julyarchive.com / admin123');
    console.log('👤 User: user@julyarchive.com / user123');
    
  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

setupDatabase(); 