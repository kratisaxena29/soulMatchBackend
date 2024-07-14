const mongoose = require('mongoose');
const Schema = mongoose.Schema;

allprofiles = new Schema({
    email : {
        required : "true",
        type : String
    },
   profileId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'ProfileRegister',
    required : true,
   },
    AllprofilesId : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'ProfileRegister',
            required : true
        }
    ],
   
    modifiedAt: {
        type: Date,
    },
});


AllProfiles = mongoose.model('AllProfiles', allprofiles);
module.exports = { AllProfiles };