const express = require('express');
const router = express.Router();
const Register = require("../controller/User")
const EmailOtp = require("../controller/emailOtp")
const VerifyOtp = require("../controller/verifyOtp")
// Define routes
router.post('/user-register', Register.UserRegister);
router.post('/email-otp',EmailOtp.sendOTPByEmail)
router.post('/verify-otp',VerifyOtp.verifyOtp )


// Export router
module.exports = router;
