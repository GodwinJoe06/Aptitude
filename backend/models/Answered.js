const mongoose = require('mongoose');

const AttendedSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  alreadyAttended: {
    type: Boolean,
    required: true
  }
});
module.exports = mongoose.model('Attended', AttendedSchema);