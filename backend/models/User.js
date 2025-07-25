const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user'},
  batch: { type: String, enum: ['Batch 1', 'Batch 2']},
});

module.exports = mongoose.model('User', userSchema);
