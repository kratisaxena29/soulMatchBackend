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


router.post('/api/user-register', Register.UserRegister);
router.get('/api/',Register.Testing)
router.post('/api/email-otp',EmailOtp.sendOTPByEmail)
router.post('/api/verify-otp',VerifyOtp.verifyOtp )
router.post('/api/profile-register',profile_register.profileRegister)
router.post('/api/login',Register.UserLogin)
router.get('/api/getAllprofile',profile_register.getAllProfiles) 
router.post('/api/upload', upload.single('image'), ImageUploader.ImageUpload);
router.post('/api/upload-dp', upload.single('imagedp'), dpUploader.dpUpload);
router.get('/api/getimagepath',ImageUploader.getprofileByemail)
router.post('/api/allProfileId',profile_register.pushAllTheprofilesId)
router.get('/api/getallProfileById',profile_register.getAlltheProfileId)
router.post('/api/conversation',ChatApi.createConversation)
router.get('/api/conversation/:userId',ChatApi.getconversationByuserId)
router.post('/api/message',ChatApi.createMessage)
router.get('/api/message/:conversationId',ChatApi.getMessageByConversationId)
router.post('/api/pay',PaymentAPI.newPayment)
router.post('/api/status/:transactionId',PaymentAPI.checkStatus);
router.post('/api/forgot-otp',Register.sendOTPForForgotPassword)
router.post('/api/password-reset',Register.otpPasswordChange)
router.get('/api/profile/:id',profile_register.getprofileById)
// router.post('/generate-about-us', OpenAI.generate_AboutUs);
router.post('/api/upload-identification/:email', upload.single('file'),ImageUploader.IdentificationImageUpload)

// Export router
module.exports = router;
