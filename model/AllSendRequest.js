const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const allSendRequestSchema = new Schema({
  email: {
    type: String,
    required: function() {
      return !this.phoneno; // Email is required if phoneno is not provided
    },
    validate: {
      validator: function(v) {
        // Custom validation: If no email and no phone number, return false
        return !!(this.phoneno || v);
      },
      message: 'Either email or phone number is required.',
    },
  },
  phoneno: {
    type: String,
    required: function() {
      return !this.email; // Phoneno is required if email is not provided
    },
    validate: {
      validator: function(v) {
        return !!(this.email || v); // Custom validation
      },
      message: 'Either phone number or email is required.',
    },
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProfileRegister',
    required: true,
  },
  AllprofilesId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProfileRegister',
      required: true,
    },
  ],
  modifiedAt: {
    type: Date,
    default: Date.now,  // Automatically sets the current date
  },
});

// Pre-save middleware to update modifiedAt
allSendRequestSchema.pre('save', function(next) {
  this.modifiedAt = Date.now();
  next();
});

const AllSendRequest = mongoose.model('AllSendRequest', allSendRequestSchema);

module.exports = { AllSendRequest };
