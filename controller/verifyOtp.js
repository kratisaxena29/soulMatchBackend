const { OtpData } = require("../model/Otp")

const verifyOtp = async(req, res) => {
    try {
      const { email, otp } = req.body;
      console.log("Verifying OTP for email:", email, "OTP:", otp);
      const otpEntry = await OtpData.findOne({ email, otp });
      console.log("...otp from db ..", otpEntry)
      if (otpEntry) {
        // OTP matches
        res.status(200).send("OTP matches.");
      } else {
        // OTP does not match
        res.status(400).send("OTP does not match.");
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal server error.");
    }
  };

  
  module.exports = {
    verifyOtp
  }