const mongoose = require('mongoose');
const Schema = mongoose.Schema;

imageUpload = new Schema({
   
    email : {
        type: String,
        require : true
    },
    modifiedAt: {
        type: Date,
    },
});


ImageUpload = mongoose.model('ImageUpload', imageUpload);
module.exports = { ImageUpload };