const mongoose = require('mongoose');
const Schema = mongoose.Schema;

user = new Schema({
firstName : {
    type: String,
    required : true
},
lastName : {
    type: String,
    required : true
},
   
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        
    },
    profileVerified : {
        type : Boolean,
       default : false
    }, 
    emailVerified : {
        type : Boolean,
        default : false
    } ,

   


    modifiedAt: {
        type: Date,
    },
});


User = mongoose.model('User', user);
module.exports = { User };