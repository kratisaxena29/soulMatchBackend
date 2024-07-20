const mongoose = require('mongoose');
const Schema = mongoose.Schema;

profileRegister = new Schema({
    email : {
        type: String,
        required : true 
    },
name : {
    type: String,
    required : true
},
gender : {
    type: String,
    required : true
},
   
   age : {
    type: String,
    required : true
   },
   martialStatus : {
    type: String,
    required : true
   },
   nationality : {
    type: String,
    required : true
   },
   city : {
    type: String,
    required : true
   },
   religion : {
    type: String,
    required : true
   },
   disability : {
    type: String,
    required : false
   },
   disabilityDetail : {
    type: String,
    required : false
   },
   caste : {
    type: String,
    required : true
   },
   subCaste : {
    type: String,
    required : true
   },
   origin : {
    type: String,
    required : true
   },
   motherTongue : {
    type: String,
    required : false
   },
   height : {
    type: String,
    required : true
   },
   hobbies : [{
    type: String,
    required : false
   }],
   address : {
    type: String,
    required : true
   },
   phoneNo : {
    type: Number,
    required : true
   },
   aboutYourSelf : {
    type: String,
    required : true
   },
   weight : {
    type: String,
    required : true
   },
   gothra : {
    type: String,
    required : true
   }, 
   petFriendly : {
    type: String,
    required : true
   },
   heighestEduction : {
    type: String,
    required : true
   },
   currentEmployee : {
    type: String,
    required : true
   },
   profession : {
    type: String,
    required : true
   },
   annualIncome : {
    type: String,
    required : true
   },
   yearsofExperience : {
    type: String,
    required : true
   },
   dateOfBirth : {
    type: String,
    required : true
   },
   timeOfBirth : {
    type: String,
    required : true
   }, 
   placeofBirth : {
    type: String,
    required : true
   },
   areYouManglik  : {
    type: String,
    required : true
   },
   diet : {
    type: String,
    required : true
   },
   alcohol : {
    type: String,
    required : true
   },
   smoke : {
    type: String,
    required : true
   },
   interest : {
    type: String,
    required : false
   },
   family_Type: {
    type: String,
    required : false
   },
   FathersName : {
    type: String,
    required : false
   },
   Fathers_prof : {
    type: String,
    required : false
   },
   MothersName : {
    type: String,
    required : false
   },
   Mothers_prof : {
    type: String,
    required : false
   },
   sister : {
    type : Number
   },
   sisterName : [
    {
        type:String
    }
   ],
   sisterProfession : [
    {
        type:String
    }
   ],
   brother : {
    type : Number
   },
   brotherName : [
    {
        type:String
    }
   ],
   brotherProfession : [
    {
        type:String
    }
   ],
    Part_ageFrom : {
        type: String,
    required : true 
    },
    Part_martialStatus : {
        type: String,
        required : true
    },
    Part_Religion : {
        type: String,
        required : true
    },
    Part_Caste : {
        type: String,
        required : true
    },
    Part_motherTongue : {
        type: String,
        required : true
    },
    Part_height : {
        type: String,
        required : true
    },
    Part_horoscopeMatch : {
        type: String,
        required : true
    },
    Part_petFriendly : {
        type: String,
        required : true
    },
    Part_heighestEduction : {
        type: String,
        required : true
    },
    Part_currentEmployee : {
        type: String,
        required : true
    },
    Part_profession : {
        type: String,
        required : true
    },
    Part_annualIncome : {
        type: String,
        required : true
    },
    Part_yearsOfExpereience : {
        type: String,
        required : true
    },
    Part_deit : {
        type: String,
        required : true
    },
    Part_alcohol : {
        type: String,
        required : true
    },
    Part_smoke : {
        type: String,
        required : true
    },
    Part_interest : {
        type: String,
        required : false
    },
    fileUpload : {
        type: String,
        default : null
    },

    modifiedAt: {
        type: Date,
    },
});


ProfileRegister = mongoose.model('ProfileRegister', profileRegister);
module.exports = { ProfileRegister };
