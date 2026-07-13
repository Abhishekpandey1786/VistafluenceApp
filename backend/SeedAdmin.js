require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedAdmin() {
  try {
    const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

    if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('❌ MONGO_URI, ADMIN_EMAIL ya ADMIN_PASSWORD .env me missing hai');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    await User.create({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      name: ADMIN_NAME || 'Super Admin',
    });

    console.log('✅ Admin created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seedAdmin();