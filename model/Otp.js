const mongoose = require('mongoose');
const Schema = mongoose.Schema;

otpdata = new Schema({
    email: {
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


OtpData = mongoose.model('OtpData', otpdata);
module.exports = { OtpData };