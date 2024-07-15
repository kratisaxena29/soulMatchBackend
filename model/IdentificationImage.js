const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const identificationImage = new Schema({
    email: {
        type: String,
        required: true
    },
    identificationImageUrl: {
        type: String,
        required: true
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
});

const IdentificationImage = mongoose.model('IdentificationImage', identificationImage);

module.exports = { IdentificationImage };
