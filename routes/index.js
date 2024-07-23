const express = require('express');
const multer = require('multer');
const router = express.Router();
const Register = require("../controller/User")
const EmailOtp = require("../controller/emailOtp")
const VerifyOtp = require("../controller/verifyOtp")
const profile_register = require("../controller/profile_register")
const ImageUploader = require("../controller/ImageUpload")
const dpUploader = require("../controller/dpUpload")
const storage = multer.memoryStorage();
const upload = multer({ storage });
const ChatApi = require("../controller/ChatApi")
const PaymentAPI = require("../controller/Payment")
// const OpenAI = require("../controller/OpenAi")

// Define routes


router.post('/user-register', Register.UserRegister);
router.get('/',Register.Testing)
router.post('/email-otp',EmailOtp.sendOTPByEmail)
router.post('/verify-otp',VerifyOtp.verifyOtp )
router.post('/profile-register',profile_register.profileRegister)
router.post('/login',Register.UserLogin)
router.get('/getAllprofile',profile_register.getAllProfiles) 
router.post('/upload', upload.single('image'), ImageUploader.ImageUpload);
router.post('/upload-dp', upload.single('imagedp'), dpUploader.dpUpload);
router.get('/getimagepath',ImageUploader.getprofileByemail)
router.post('/allProfileId',profile_register.pushAllTheprofilesId)
router.get('/getallProfileById',profile_register.getAlltheProfileId)
router.post('/conversation',ChatApi.createConversation)
router.get('/conversation/:userId',ChatApi.getconversationByuserId)
router.post('/message',ChatApi.createMessage)
router.get('/message/:conversationId',ChatApi.getMessageByConversationId)
router.post('/pay',PaymentAPI.newPayment)
router.post('/status/:transactionId',PaymentAPI.checkStatus);
router.post('/forgot-otp',Register.sendOTPForForgotPassword)
router.post('/password-reset',Register.otpPasswordChange)
router.get('/profile/:id',profile_register.getprofileById)
// router.post('/generate-about-us', OpenAI.generate_AboutUs);
router.post('/upload-identification/:email', upload.single('file'),ImageUploader.IdentificationImageUpload)

// Export router
module.exports = router;
