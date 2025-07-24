const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // adjust path if needed
require('dotenv').config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Clear existing users (optional)
    await User.deleteMany({});

    const saltRounds = 10;

    const users = [
      {
        name: 'Joe',
        email: 'joe@gmail.com',
        password: await bcrypt.hash('12345', saltRounds),
        role: 'admin',
      },
      {
        name: 'Feli',
        email: 'feli@gmail.com',
        password: await bcrypt.hash('12345', saltRounds),
        role: 'user',
      },
      {
        name: 'Kevin',
        email: 'kevin@gmail.com',
        password: await bcrypt.hash('12345', saltRounds),
        role: 'user',
      },
    ];

    await User.insertMany(users);
    console.log('✅ Users seeded successfully!');
  } catch (err) {
    console.error('❌ Error seeding users:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedUsers();
