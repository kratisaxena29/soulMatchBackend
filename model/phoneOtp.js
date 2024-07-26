const mongoose = require('mongoose');
const Schema = mongoose.Schema;

phoneotpdata = new Schema({
    phoneno: {
        type: String,
        required: true,
        unique: true
    },
    subject : {
        type: String,
        required: true,  
    },
    otp : {
        type: Number,
        required : true
    },
    modifiedAt: {
        type: Date,
    },
});


Phoneotpdata = mongoose.model('Phoneotpdata', phoneotpdata);
module.exports = { Phoneotpdata };