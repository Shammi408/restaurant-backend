const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./models/user'); // path to your User model

async function createSuperAdmin() {
  await mongoose.connect(process.env.MONGO_URI);

  const email = 'superadmin2@example.com';
  const password = 'StrongPassword123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Super admin already exists');
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = new User({
    name: 'Super Shammi',
    email,
    password,
    role: 'superadmin',
  });

  await superAdmin.save();
  console.log('Super admin created successfully');
  process.exit(0);
}

createSuperAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
