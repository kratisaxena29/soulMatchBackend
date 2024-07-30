const mongoose = require('mongoose');
const Schema = mongoose.Schema;

photurl = new Schema({
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