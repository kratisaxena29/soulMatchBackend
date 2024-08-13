const mongoose = require('mongoose');
const Schema = mongoose.Schema;

photurl = new Schema({
    id: {
        type: mongoose.Schema.Types.ObjectId, // Define the id as an ObjectId
        ref: 'ProfileRegister', // Reference the ProfileRegister model
        required: false,
    },
    email: {
        type: String,
        required: true,
      
    },
     photoUrl : [{
        type: String,
        required: true,  
}],
    
    modifiedAt: {
        type: Date,
    },
});


Photurl = mongoose.model('Photurl', photurl);
module.exports = { Photurl };