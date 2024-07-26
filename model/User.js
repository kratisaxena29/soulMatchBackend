const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows uniqueness only if the field exists
  },
  phoneno: {
    type: String, // Use String to accommodate various phone formats
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileVerified: {
    type: Boolean,
    default: false,
  },
  Verified: {
    type: Boolean,
    default: false,
  },
  modifiedAt: {
    type: Date,
    default: Date.now, // Set default to current date
  },
});

const User = mongoose.model('User', userSchema);
module.exports = { User };
