const mongoose = require('mongoose');
const Schema = mongoose.Schema;

OtpforgotPassword = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
     subject : {
        type: String,
        required: true,  
    },
    // password : {
    //     type: String,
    //     required: true,  
    // },
    otp : {
        type: Number,
        required : true
    },
    modifiedAt: {
        type: Date,
    },
});


OtpForgotPassword = mongoose.model('OtpForgotPassword', OtpforgotPassword);
module.exports = { OtpForgotPassword };