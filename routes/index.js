const express = require('express');
const router = express.Router();
const Register = require("../controller/User")

// Define routes
router.post('/user-register', Register.UserRegister);


// Export router
module.exports = router;
