const express = require('express');
const multer = require('multer');
const router = express.Router();
const Register = require("../controller/User")
const EmailOtp = require("../controller/emailOtp")
const VerifyOtp = require("../controller/verifyOtp")
const profile_register = require("../controller/profile_register")
const ImageUploader = require("../controller/ImageUpload")
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define routes
router.post('/user-register', Register.UserRegister);
router.post('/email-otp',EmailOtp.sendOTPByEmail)
router.post('/verify-otp',VerifyOtp.verifyOtp )
router.post('/profile-register',profile_register.profileRegister)
router.post('/login',Register.UserLogin)
router.get('/getAllprofile',profile_register.getAllProfiles) 
router.post('/upload', upload.single('image'), ImageUploader.ImageUpload);


// Export router
module.exports = router;
