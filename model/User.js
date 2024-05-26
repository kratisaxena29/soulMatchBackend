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
   


    modifiedAt: {
        type: Date,
    },
});


User = mongoose.model('User', user);
module.exports = { User };