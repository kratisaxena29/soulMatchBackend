const express = require('express');
const multer = require('multer');
const router = express.Router();
const Register = require("../controller/User")
const EmailOtp = require("../controller/emailOtp")
const PhoneOtp = require("../controller/phoneOtp")
const VerifyOtp = require("../controller/verifyOtp")
const profile_register = require("../controller/profile_register")
const ImageUploader = require("../controller/ImageUpload")
const dpUploader = require("../controller/dpUpload")
const storage = multer.memoryStorage();
const upload = multer({ storage });
const ChatApi = require("../controller/ChatApi")
const PaymentAPI = require("../controller/Payment")
const uplaodMultiplePhoto = require("../controller/multiplePhoto")
const DashboardAPI = require("../controller/DashboardAPi")
const uploadData = multer({storage})
// const OpenAI = require("../controller/OpenAi")

// Define routes


router.post('/user-register', Register.UserRegister);
router.get('/',Register.Testing)
router.post('/email-otp',EmailOtp.sendOTPByEmail)
router.post('/welcome-email',EmailOtp.sendWelcomeProfileByEmail)
router.post('/phone-otp',PhoneOtp.sendOTPByPhone)
router.post('/phoneverify-otp',PhoneOtp.verifyPhoneOtp)
router.post('/verify-otp',VerifyOtp.verifyOtp )
router.post('/profile-register',profile_register.profileRegister)
router.put('/ProfileUpdate/:identifier',profile_register.ProfileUpdate)
router.post('/login',Register.UserLogin)
router.get('/getAllprofile',profile_register.getAllProfiles) 
router.post('/upload', upload.single('image'), ImageUploader.ImageUpload);
router.post('/upload-dp', upload.single('imagedp'), dpUploader.dpUpload);
router.get('/getimagepath/:identifier',ImageUploader.getprofileByemail)
router.post('/allProfileId',profile_register.pushAllTheprofilesId)
router.post('/AlltheSendRequestId',profile_register.pushAllTheSendId)
router.get('/getAllRequestById/:id',profile_register.getAllRequestById)
router.get('/deleteRequestById',profile_register.deleteRequestById)
router.get('/getallProfileById',profile_register.getAlltheProfileId)
router.post('/conversation',ChatApi.createConversation)
router.get('/conversation/:userId',ChatApi.getconversationByuserId)
router.post('/message',ChatApi.createMessage)
router.get('/message/:conversationId',ChatApi.getMessageByConversationId)
router.post('/pay',PaymentAPI.newPayment)
router.post('/status/:transactionId',PaymentAPI.checkStatus);
router.post('/forgot-otp',Register.sendOTPForForgotPassword)
router.post('/password-reset',Register.otpPasswordChange)
router.get('/profile/:identifier',profile_register.getprofileById)
router.get('/oneProfileByEmail/:identifier',profile_register.getprofileByEmail)
router.get('/getphotosByEmailOrPhoneNo/:identifier',profile_register.getphotosByEmailOrPhoneNo)
router.get('/getphotosById/:identifier',profile_register.getphotosById)
router.get('/profilebyid/:identifier',profile_register.getOneprofileById)
router.post('/deletephotosByEmailOrPhoneNo/:identifier',profile_register.deletephotosByEmailOrPhoneNo)
// router.post('/generate-about-us', OpenAI.generate_AboutUs);

router.post('/upload-multiple-photo/:identifier', uploadData.single('file'),uplaodMultiplePhoto.photoUrlfunction)
router.get('/getNoOfProfiles',DashboardAPI.getNoOfProfiles)
router.get('/Today-registration',DashboardAPI.TodayRegistration)
router.get('/active-subscription',DashboardAPI.activeSubscription)
router.get('/verify-profile/:id',DashboardAPI.verifyProfile)
router.delete('/deleteProfile/:id',DashboardAPI.deleteProfile)
router.get('/getMonthlyUserCount',DashboardAPI.getMonthlyUserCount)
// Export router
module.exports = router;
