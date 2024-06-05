const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageUploadSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    modifiedAt: {
        type: Date,
        default: Date.now
    }
});

const ImageUploadURL = mongoose.model('ImageUploadURL', imageUploadSchema);

module.exports = { ImageUploadURL };
