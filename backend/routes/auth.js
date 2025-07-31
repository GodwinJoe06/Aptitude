const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Attended = require('../models/Answered');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, role , batch } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashed, role ,batch});
  await user.save();
  res.json({ msg: 'Registered' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  const userId = await User.findOne({ email });
  if (!userId) { 
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  const alreadyAttended = await Attended.find({ userId: userId._id });
  // console.log('Already attended:', alreadyAttended); 
  if (alreadyAttended.length > 0 && alreadyAttended[0].alreadyAttended) {
    return res.status(400).json({ msg: 'You have already attempted the exam today.' });
  }
  
  console.log('User found:', { userId: userId._id });

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  const payload = {
    user: {
      id: user._id
    }
  };


  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
  console.log('Login successful:', { userId: user._id, role: user.role });
});

module.exports = router;
