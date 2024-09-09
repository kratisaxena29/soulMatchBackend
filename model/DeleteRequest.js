const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deleteRequest = new Schema({
    
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProfileRegister',
        required: true,
    },
    AllprofilesId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProfileRegister',
            required: true
        }
    ],
    modifiedAt: {
        type: Date,
    },
});

const DeleteRequest = mongoose.model('DeleteRequest', deleteRequest);
module.exports = { DeleteRequest };
