const mongoose = require('mongoose');
const Schema = mongoose.Schema;

profileRegister = new Schema({
    email : {
        type: String,
        required : false 
    },
    // userId : {
    //     type: String,
    //     required : true   
    // },
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
    required : false
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
   drink : {
    type: String,
    required : false
   },
  
   phoneNo : {
    type: String,
    required : false
   },
   aboutYourSelf : {
    type: String,
    required : true
   },
   plan : {
    type: String,
    default : null
   },
   transactionId : {
    type: String,
    default : null
   },
   verifyProfile : {
    type: Boolean,
    default : false
   },
   weight : {
    type: String,
    required : true
   },
   
   petFriendly : {
    type: String,
    required : false
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
   country : {
    type: String,
    required : false
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
    required : false
   }, 
   placeofBirth : {
    type: String,
    required : false
   },
   areYouManglik  : {
    type: String,
    required : false
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
    Part_ageFrom : [{
        type: String,
    required : false 
    }],
    Part_martialStatus : [{
        type: String,
        required : false
    }],
    Part_Religion : [{
        type: String,
        required : false
    }],
    Part_Caste : [{
        type: String,
        required : false
    }],
    Part_motherTongue : [{
        type: String,
        required : false
    }],
    Part_subCaste : [{
        type : String, 
        required : false
    }],
    Part_height : [{
        type: String,
        required : false
    }],
    Part_horoscopeMatch : [{
        type: String,
        required : false
    }],
    Part_petFriendly : [{
        type: String,
        required : false
    }],
    Part_heighestEduction : [{
        type: String,
        required : false
    }],
    Part_currentEmployee : [{
        type: String,
        required : false
    }],
    Part_profession : [{
        type: String,
        required : false
    }],
    Part_annualIncome : [{
        type: String,
        required : false
    }],
    Part_yearsOfExpereience : [{
        type: String,
        required : false
    }],
    Part_gender : {
        type: String,
        required : false 
    },
    Part_deit : [{
        type: String,
        required : false
    }],
    Part_alcohol : [{
        type: String,
        required : false
    }],
    Part_smoke : [{
        type: String,
        required : false
    }],
    Part_interest : [{
        type: String,
        required : false
    }],
    fileUpload : {
        type: String,
        default : null
    },
    modifiedAt: {
        type: Date,
        default: Date.now, // Set default to current date
      },
});


ProfileRegister = mongoose.model('ProfileRegister', profileRegister);
module.exports = { ProfileRegister };
