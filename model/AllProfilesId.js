const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const allprofiles = new Schema({
    email: {
        type: String,
        required: function() {
            return !this.phoneno; // Email is required if phoneno is not provided
        }
    },
    phoneno: {
        type: String,
        required: function() {
            return !this.email; // Phoneno is required if email is not provided
        }
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
            required: true
        }
    ],
    modifiedAt: {
        type: Date,
    },
});

const AllProfiles = mongoose.model('AllProfiles', allprofiles);
module.exports = { AllProfiles };
